import { supabase } from '../lib/supabaseClient';
import { FollowUp } from '../types/database';

export interface CreateFollowUpInput {
  lead_id: string;
  due_at: string;
  note: string;
  assigned_to?: string | null;
}

export interface FollowUpFilterParams {
  status?: 'all' | 'pending' | 'completed' | 'overdue';
  leadId?: string;
  search?: string;
}

export const followUpService = {
  /**
   * Fetches all scheduled follow-ups accessible to current user under RLS.
   */
  async getFollowUps(filters?: FollowUpFilterParams): Promise<{ followUps: FollowUp[]; error: string | null }> {
    try {
      let query = supabase
        .from('follow_ups')
        .select(`
          *,
          lead:leads(id, full_name, phone, course_interest, status),
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `)
        .order('due_at', { ascending: true });

      if (filters?.leadId) {
        query = query.eq('lead_id', filters.leadId);
      }

      if (filters?.status === 'pending') {
        query = query.eq('status', 'pending');
      } else if (filters?.status === 'completed') {
        query = query.eq('status', 'completed');
      } else if (filters?.status === 'overdue') {
        query = query.eq('status', 'pending').lt('due_at', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error querying follow_ups:', error.message);
        return { followUps: [], error: error.message };
      }

      let result = (data as unknown as FollowUp[]) || [];

      // Optional text search by student name or note
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
          (f) =>
            f.note.toLowerCase().includes(q) ||
            (f.lead && f.lead.full_name.toLowerCase().includes(q)) ||
            (f.lead && f.lead.phone.includes(q))
        );
      }

      return { followUps: result, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to query follow-ups.';
      return { followUps: [], error: message };
    }
  },

  /**
   * Schedules a new follow-up reminder for a student lead.
   */
  async createFollowUp(input: CreateFollowUpInput): Promise<{ followUp: FollowUp | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const newFollowUp = {
        lead_id: input.lead_id,
        due_at: input.due_at,
        note: input.note.trim(),
        assigned_to: input.assigned_to || (user ? user.id : null),
        created_by: user ? user.id : null,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('follow_ups')
        .insert(newFollowUp)
        .select(`
          *,
          lead:leads(id, full_name, phone, course_interest, status),
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `)
        .single();

      if (error) {
        return { followUp: null, error: error.message };
      }

      const created = data as unknown as FollowUp;

      // Log activity in immutable audit trail
      if (user) {
        await supabase.from('activities').insert({
          lead_id: input.lead_id,
          actor_id: user.id,
          activity_type: 'follow_up_scheduled',
          description: `Scheduled follow-up: "${input.note.trim()}"`,
          metadata: {
            due_at: input.due_at,
            follow_up_id: created?.id,
          },
        });
      }

      return { followUp: created, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not schedule follow-up.';
      return { followUp: null, error: message };
    }
  },

  /**
   * Reschedules an existing follow-up with a new due date and records the action.
   */
  async rescheduleFollowUp(
    id: string, 
    newDueAt: string, 
    rescheduleNote?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: currentItem, error: fetchErr } = await supabase
        .from('follow_ups')
        .select('*, lead:leads(id, full_name)')
        .eq('id', id)
        .single();

      if (fetchErr || !currentItem) {
        return { success: false, error: fetchErr?.message || 'Follow-up not found.' };
      }

      const updatedNote = rescheduleNote?.trim()
        ? `${currentItem.note} [Rescheduled: ${rescheduleNote.trim()}]`
        : currentItem.note;

      const { error: updateErr } = await supabase
        .from('follow_ups')
        .update({
          due_at: newDueAt,
          note: updatedNote,
          status: 'pending',
          completed_at: null,
        })
        .eq('id', id);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentItem.lead_id) {
        await supabase.from('activities').insert({
          lead_id: currentItem.lead_id,
          actor_id: user.id,
          activity_type: 'follow_up_scheduled',
          description: `Follow-up rescheduled to ${new Date(newDueAt).toLocaleString()}${rescheduleNote ? ` (${rescheduleNote.trim()})` : ''}`,
          metadata: {
            follow_up_id: id,
            new_due_at: newDueAt,
            reschedule_reason: rescheduleNote || null,
          },
        });
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reschedule follow-up.';
      return { success: false, error: message };
    }
  },

  /**
   * Marks a follow-up as completed.
   */
  async completeFollowUp(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('follow_ups')
        .update({
          status: 'completed',
          completed_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const completedItem = data as unknown as FollowUp;

      // Log completion in activity log
      const { data: { user } } = await supabase.auth.getUser();
      if (user && completedItem?.lead_id) {
        await supabase.from('activities').insert({
          lead_id: completedItem.lead_id,
          actor_id: user.id,
          activity_type: 'follow_up_completed',
          description: `Completed follow-up: "${completedItem.note}"`,
          metadata: {
            completed_at: now,
            follow_up_id: id,
          },
        });
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete follow-up.';
      return { success: false, error: message };
    }
  },

  /**
   * Deletes a follow-up task (Admins/Managers or creator).
   */
  async deleteFollowUp(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.from('follow_ups').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete follow-up.';
      return { success: false, error: message };
    }
  },

  /**
   * Returns overdue count for navigation badge and KPI cards.
   */
  async getOverdueCount(): Promise<number> {
    try {
      const now = new Date().toISOString();
      const { count, error } = await supabase
        .from('follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('due_at', now);

      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  },
};
