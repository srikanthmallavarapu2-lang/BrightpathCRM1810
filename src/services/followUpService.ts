import { supabase } from '../lib/supabaseClient';
import { FollowUp } from '../types/database';

export interface CreateFollowUpInput {
  lead_id: string;
  due_at: string;
  note: string;
  assigned_to?: string | null;
}

export const followUpService = {
  /**
   * Fetches all scheduled follow-ups accessible to current user under RLS.
   */
  async getFollowUps(): Promise<{ followUps: FollowUp[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select(`
          *,
          lead:leads(id, full_name, phone, course_interest, status),
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `)
        .order('due_at', { ascending: true });

      if (error) {
        console.error('Error querying follow_ups:', error.message);
        return { followUps: [], error: error.message };
      }

      return { followUps: (data as unknown as FollowUp[]) || [], error: null };
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

      // Log activity
      if (user) {
        await supabase.from('activities').insert({
          lead_id: input.lead_id,
          actor_id: user.id,
          activity_type: 'follow_up_scheduled',
          description: `Scheduled follow-up reminder: "${input.note.trim()}"`,
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
