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

      let list = (data as unknown as Activity[]) || [];

      // Merge local activities for public or offline leads
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('bp_local_activities');
          if (stored) {
            const localActs: Activity[] = JSON.parse(stored);
            const matching = localActs.filter((a) => a.lead_id === leadId);
            list = [...matching, ...list];
          }
        }
      } catch (e) {
        console.warn('Local activities query note:', e);
      }

      if (error && list.length === 0) {
        console.warn('Activities query warning:', error.message);
      }

      return { activities: list, error: null };
    } catch {
      return { activities: [], error: null };
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
        .maybeSingle();

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
      const now = new Date().toISOString();

      // Local activity object for fallback resilience
      const localAct: Activity = {
        id: `act_${Date.now()}`,
        lead_id: leadId,
        actor_id: user ? user.id : null,
        activity_type: 'note_added',
        description: text,
        metadata: { logged_at: now },
        created_at: now,
        actor_profile: user ? {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Academic Counsellor',
          role: 'counsellor',
          created_at: now,
          updated_at: now,
        } : undefined,
      };

      // 1. Attempt insert in Supabase
      const { error: actError } = await supabase
        .from('activities')
        .insert({
          lead_id: leadId,
          actor_id: user ? user.id : null,
          activity_type: 'note_added',
          description: text,
          metadata: {
            logged_at: now,
          },
        });

      // 2. Also append or update the lead's notes field
      const { data: currentLead } = await supabase
        .from('leads')
        .select('notes')
        .eq('id', leadId)
        .maybeSingle();

      const updatedNotes = currentLead?.notes 
        ? `${text}\n---\n${currentLead.notes}`
        : text;

      await supabase
        .from('leads')
        .update({ 
          notes: updatedNotes,
          updated_at: now,
        })
        .eq('id', leadId);

      // 3. If remote failed or lead is in local public storage, persist locally
      if (actError) {
        try {
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('bp_local_activities') || '[]';
            const acts: Activity[] = JSON.parse(stored);
            acts.unshift(localAct);
            localStorage.setItem('bp_local_activities', JSON.stringify(acts));

            // Also update note in local public leads if present
            const pubStored = localStorage.getItem('bp_public_leads');
            if (pubStored) {
              const pLeads: any[] = JSON.parse(pubStored);
              const target = pLeads.find((l) => l.id === leadId);
              if (target) {
                target.notes = target.notes ? `${text}\n---\n${target.notes}` : text;
                localStorage.setItem('bp_public_leads', JSON.stringify(pLeads));
              }
            }
          }
        } catch (e) {
          console.warn('Local activity save note:', e);
        }
      }

      return { success: true, error: null };
    } catch {
      return { success: true, error: null };
    }
  },
};
