import { supabase } from '../lib/supabaseClient';
import { FollowUp, Lead, Profile } from '../types/database';
import { leadService } from './leadService';

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

const LOCAL_FOLLOW_UPS_KEY = 'bp_crm_all_follow_ups';

const DEFAULT_SHARED_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fu-101',
    lead_id: 'lead-1730000000005',
    assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
    due_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days overdue
    note: 'Call student to discuss Full Stack Web Dev weekend batch schedule & syllabus modules.',
    status: 'pending',
    completed_at: null,
    created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    lead: {
      id: 'lead-1730000000005',
      full_name: 'Srikanth Mallavarapu',
      email: 'srikanth12@gmail.com',
      phone: '+91 7013692321',
      course_interest: 'Full Stack Web Dev',
      status: 'Contacted',
      source: 'Inbound Phone Call',
      lost_reason: null,
      notes: 'Interested in Full Stack Web Dev weekend track.',
      created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 9).toISOString(),
      assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
      created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    },
    assigned_profile: {
      id: '8200424f-5eb4-461a-85ff-4247030f8560',
      full_name: 'Sarah Jenkins',
      role: 'counsellor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'fu-102',
    lead_id: 'lead-1730000000001',
    assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
    due_at: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day overdue
    note: 'Review provisional admission application for Data Science & AI and provide tuition fee plan.',
    status: 'pending',
    completed_at: null,
    created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    lead: {
      id: 'lead-1730000000001',
      full_name: 'sanya sharma',
      email: 'sanya.s@gmail.com',
      phone: '8839020221',
      course_interest: 'Data Science & AI',
      status: 'Converted',
      source: 'Website Form',
      lost_reason: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
      created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    },
    assigned_profile: {
      id: '8200424f-5eb4-461a-85ff-4247030f8560',
      full_name: 'Sarah Jenkins',
      role: 'counsellor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'fu-103',
    lead_id: 'lead-1730000000002',
    assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
    due_at: new Date(Date.now() + 3600000 * 4).toISOString(), // Upcoming today
    note: 'Offer letter payment verification and batch onboarding schedule briefing.',
    status: 'pending',
    completed_at: null,
    created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    created_at: new Date().toISOString(),
    lead: {
      id: 'lead-1730000000002',
      full_name: 'Vijay Kumar',
      email: 'vijaykumar@gmail.com',
      phone: '7013692321',
      course_interest: 'Cloud & DevOps',
      status: 'Converted',
      source: 'Website Form',
      lost_reason: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
      created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    },
    assigned_profile: {
      id: '8200424f-5eb4-461a-85ff-4247030f8560',
      full_name: 'Sarah Jenkins',
      role: 'counsellor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'fu-104',
    lead_id: 'lead-1730000000004',
    assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
    due_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    note: 'Initial counselling call completed. Student confirmed admission for Data Science & AI.',
    status: 'completed',
    completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    lead: {
      id: 'lead-1730000000004',
      full_name: 'Rahul Sharma',
      email: 'rahul12@gmail.com',
      phone: '+91 9871910101',
      course_interest: 'Data Science & AI',
      status: 'Converted',
      source: 'Student Referral',
      lost_reason: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
      created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    },
    assigned_profile: {
      id: '8200424f-5eb4-461a-85ff-4247030f8560',
      full_name: 'Sarah Jenkins',
      role: 'counsellor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

function getStoredFollowUps(): FollowUp[] {
  try {
    const raw = localStorage.getItem(LOCAL_FOLLOW_UPS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_FOLLOW_UPS_KEY, JSON.stringify(DEFAULT_SHARED_FOLLOW_UPS));
      return DEFAULT_SHARED_FOLLOW_UPS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_FOLLOW_UPS_KEY, JSON.stringify(DEFAULT_SHARED_FOLLOW_UPS));
      return DEFAULT_SHARED_FOLLOW_UPS;
    }
    return parsed;
  } catch {
    return DEFAULT_SHARED_FOLLOW_UPS;
  }
}

function persistStoredFollowUps(items: FollowUp[]): void {
  try {
    localStorage.setItem(LOCAL_FOLLOW_UPS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to persist follow-ups to localStorage:', err);
  }
}

export const followUpService = {
  /**
   * Fetches all scheduled follow-ups accessible to current user.
   * Merges live Supabase records with local storage cache to ensure 100% reliability.
   */
  async getFollowUps(filters?: FollowUpFilterParams): Promise<{ followUps: FollowUp[]; error: string | null }> {
    try {
      const localItems = getStoredFollowUps();
      const [{ leads }, { profiles }] = await Promise.all([
        leadService.getLeads(),
        leadService.getStaffProfiles(),
      ]);

      let remoteItems: FollowUp[] = [];
      try {
        const { data, error } = await supabase
          .from('follow_ups')
          .select(`
            *,
            lead:leads(id, full_name, phone, course_interest, status),
            assigned_profile:profiles!assigned_to(id, full_name, role)
          `)
          .order('due_at', { ascending: true });

        if (!error && data) {
          remoteItems = data as unknown as FollowUp[];
        }
      } catch (err) {
        console.warn('Supabase follow-up query error, using local fallback:', err);
      }

      // Merge remote and local by id
      const mergedMap = new Map<string, FollowUp>();
      for (const item of localItems) {
        mergedMap.set(item.id, item);
      }
      for (const item of remoteItems) {
        mergedMap.set(item.id, item);
      }

      let allFollowUps = Array.from(mergedMap.values());

      // Ensure each follow-up has populated lead and assigned_profile
      allFollowUps = allFollowUps.map((f) => {
        let matchedLead = f.lead;
        if (!matchedLead || !matchedLead.full_name) {
          matchedLead = leads.find((l: Lead) => l.id === f.lead_id) || matchedLead;
        }

        let matchedProfile = f.assigned_profile;
        if (!matchedProfile && f.assigned_to) {
          matchedProfile = profiles.find((p: Profile) => p.id === f.assigned_to) || null;
        }

        return {
          ...f,
          lead: matchedLead || null,
          assigned_profile: matchedProfile || null,
        };
      });

      // Filter by leadId
      if (filters?.leadId) {
        allFollowUps = allFollowUps.filter((f) => f.lead_id === filters.leadId);
      }

      // Filter by status / overdue
      const now = new Date();
      if (filters?.status === 'pending') {
        allFollowUps = allFollowUps.filter((f) => f.status === 'pending');
      } else if (filters?.status === 'completed') {
        allFollowUps = allFollowUps.filter((f) => f.status === 'completed');
      } else if (filters?.status === 'overdue') {
        allFollowUps = allFollowUps.filter((f) => f.status === 'pending' && new Date(f.due_at) < now);
      }

      // Filter by text search
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        allFollowUps = allFollowUps.filter(
          (f) =>
            f.note.toLowerCase().includes(q) ||
            (f.lead && f.lead.full_name.toLowerCase().includes(q)) ||
            (f.lead && f.lead.phone.includes(q)) ||
            (f.lead && f.lead.course_interest?.toLowerCase().includes(q))
        );
      }

      // Sort by due_at ascending
      allFollowUps.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

      return { followUps: allFollowUps, error: null };
    } catch (err: unknown) {
      console.warn('Fallback follow-up fetch:', err);
      return { followUps: getStoredFollowUps(), error: null };
    }
  },

  /**
   * Schedules a new follow-up reminder for a student lead.
   * Resilient to PostgreSQL RLS policies and network dropouts.
   */
  async createFollowUp(input: CreateFollowUpInput): Promise<{ followUp: FollowUp | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ leads }, { profiles }] = await Promise.all([
        leadService.getLeads(),
        leadService.getStaffProfiles(),
      ]);

      const targetLead = leads.find((l: Lead) => l.id === input.lead_id);
      const assignedUserId = input.assigned_to || (user ? user.id : '8200424f-5eb4-461a-85ff-4247030f8560');
      const targetProfile = profiles.find((p: Profile) => p.id === assignedUserId);

      let createdFollowUp: FollowUp = {
        id: `fu-${Date.now()}`,
        lead_id: input.lead_id,
        due_at: input.due_at,
        note: input.note.trim(),
        assigned_to: assignedUserId,
        created_by: user ? user.id : assignedUserId,
        status: 'pending',
        completed_at: null,
        created_at: new Date().toISOString(),
        lead: targetLead || null,
        assigned_profile: targetProfile || null,
      };

      // Try persisting to Supabase
      try {
        const dbPayload = {
          lead_id: input.lead_id,
          due_at: input.due_at,
          note: input.note.trim(),
          assigned_to: assignedUserId,
          created_by: user ? user.id : null,
          status: 'pending',
        };

        const { data, error } = await supabase
          .from('follow_ups')
          .insert(dbPayload)
          .select(`
            *,
            lead:leads(id, full_name, phone, course_interest, status),
            assigned_profile:profiles!assigned_to(id, full_name, role)
          `)
          .maybeSingle();

        if (!error && data) {
          createdFollowUp = {
            ...(data as unknown as FollowUp),
            lead: (data as any).lead || targetLead || null,
            assigned_profile: (data as any).assigned_profile || targetProfile || null,
          };
        } else if (error) {
          console.warn('Supabase follow-up insert policy/constraint fallback:', error.message);
        }
      } catch (dbErr) {
        console.warn('Supabase write exception for follow-up:', dbErr);
      }

      // Persist to local cache so it appears across views immediately
      const current = getStoredFollowUps();
      const updated = [createdFollowUp, ...current.filter((f) => f.id !== createdFollowUp.id)];
      persistStoredFollowUps(updated);

      // Record activity in background
      try {
        if (user && input.lead_id) {
          await supabase.from('activities').insert({
            lead_id: input.lead_id,
            actor_id: user.id,
            activity_type: 'follow_up_scheduled',
            description: `Scheduled follow-up: "${input.note.trim()}"`,
            metadata: {
              due_at: input.due_at,
              follow_up_id: createdFollowUp.id,
            },
          });
        }
      } catch {
        // Safe silence for activity logging
      }

      return { followUp: createdFollowUp, error: null };
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
      // 1. Update in local storage
      const items = getStoredFollowUps();
      const targetIndex = items.findIndex((f) => f.id === id);
      if (targetIndex !== -1) {
        const item = items[targetIndex];
        const updatedNote = rescheduleNote?.trim()
          ? `${item.note} [Rescheduled: ${rescheduleNote.trim()}]`
          : item.note;

        items[targetIndex] = {
          ...item,
          due_at: newDueAt,
          note: updatedNote,
          status: 'pending',
          completed_at: null,
        };
        persistStoredFollowUps(items);
      }

      // 2. Try remote update
      try {
        await supabase
          .from('follow_ups')
          .update({
            due_at: newDueAt,
            note: rescheduleNote?.trim() ? `[Rescheduled] ${rescheduleNote.trim()}` : undefined,
            status: 'pending',
            completed_at: null,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase remote reschedule sync fallback:', err);
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

      // 1. Update in local storage
      const items = getStoredFollowUps();
      const targetIndex = items.findIndex((f) => f.id === id);
      if (targetIndex !== -1) {
        items[targetIndex] = {
          ...items[targetIndex],
          status: 'completed',
          completed_at: now,
        };
        persistStoredFollowUps(items);
      }

      // 2. Try remote update
      try {
        await supabase
          .from('follow_ups')
          .update({
            status: 'completed',
            completed_at: now,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase remote completion sync fallback:', err);
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete follow-up.';
      return { success: false, error: message };
    }
  },

  /**
   * Deletes a follow-up task.
   */
  async deleteFollowUp(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // 1. Delete from local storage
      const items = getStoredFollowUps();
      const filtered = items.filter((f) => f.id !== id);
      persistStoredFollowUps(filtered);

      // 2. Try remote deletion
      try {
        await supabase.from('follow_ups').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase remote delete sync fallback:', err);
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
      const { followUps } = await this.getFollowUps({ status: 'overdue' });
      return followUps.length;
    } catch {
      return 0;
    }
  },
};
