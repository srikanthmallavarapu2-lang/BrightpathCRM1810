import { supabase } from '../lib/supabaseClient';
import { Activity, ActivityType } from '../types/database';

export interface LogActivityInput {
  lead_id: string;
  activity_type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
}

export const activityService = {
  /**
   * Fetches all audit activity events for a specific student lead,
   * joined with actor profile details.
   */
  async getActivitiesByLeadId(leadId: string): Promise<{ activities: Activity[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          actor_profile:profiles!actor_id(id, full_name, role)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error.message);
        return { activities: [], error: error.message };
      }

      return { activities: (data as unknown as Activity[]) || [], error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to query activity history.';
      return { activities: [], error: message };
    }
  },

  /**
   * Logs a new immutable activity event in Supabase.
   */
  async logActivity(input: LogActivityInput): Promise<{ activity: Activity | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const newRecord = {
        lead_id: input.lead_id,
        actor_id: user ? user.id : null,
        activity_type: input.activity_type,
        description: input.description.trim(),
        metadata: input.metadata || {},
      };

      const { data, error } = await supabase
        .from('activities')
        .insert(newRecord)
        .select(`
          *,
          actor_profile:profiles!actor_id(id, full_name, role)
        `)
        .single();

      if (error) {
        return { activity: null, error: error.message };
      }

      return { activity: data as unknown as Activity, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not log activity.';
      return { activity: null, error: message };
    }
  },

  /**
   * Adds a counsellor interaction note to a student lead,
   * creating a note_added activity event and updating the lead's notes field.
   */
  async addCounsellorNote(
    leadId: string, 
    noteText: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const text = noteText.trim();
      if (!text) {
        return { success: false, error: 'Note cannot be empty.' };
      }

      const { data: { user } } = await supabase.auth.getUser();

      // 1. Insert immutable note_added activity
      const { error: actError } = await supabase
        .from('activities')
        .insert({
          lead_id: leadId,
          actor_id: user ? user.id : null,
          activity_type: 'note_added',
          description: text,
          metadata: {
            logged_at: new Date().toISOString(),
          },
        });

      if (actError) {
        return { success: false, error: actError.message };
      }

      // 2. Also append or update the lead's latest notes for quick summary display
      const { data: currentLead } = await supabase
        .from('leads')
        .select('notes')
        .eq('id', leadId)
        .single();

      const updatedNotes = currentLead?.notes 
        ? `${text}\n---\n${currentLead.notes}`
        : text;

      await supabase
        .from('leads')
        .update({ 
          notes: updatedNotes,
          updated_at: new Date().toISOString() 
        })
        .eq('id', leadId);

      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to record interaction note.';
      return { success: false, error: message };
    }
  },
};
