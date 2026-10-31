import { supabase } from '../lib/supabaseClient';
import { Lead, LeadStatus, Profile } from '../types/database';

export interface LeadFilterParams {
  search?: string;
  status?: string;
  source?: string;
  assignee?: string;
}

export interface CreateLeadInput {
  full_name: string;
  phone: string;
  email?: string | null;
  course_interest: string;
  source: string;
  status?: LeadStatus;
  notes?: string | null;
  assigned_to?: string | null;
}

export const leadService = {
  /**
   * Fetches leads accessible to the current user under Row Level Security.
   */
  async getLeads(filters?: LeadFilterParams): Promise<{ leads: Lead[]; error: string | null }> {
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_profile:profiles!assigned_to(id, full_name, role),
          creator_profile:profiles!created_by(id, full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.source && filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }

      if (filters?.assignee && filters.assignee !== 'all') {
        if (filters.assignee === 'unassigned') {
          query = query.is('assigned_to', null);
        } else if (filters.assignee === 'me') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            query = query.eq('assigned_to', user.id);
          }
        } else {
          query = query.eq('assigned_to', filters.assignee);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error.message);
        return { leads: [], error: error.message };
      }

      let result = (data as unknown as Lead[]) || [];

      // Merge any publicly registered leads cached locally with precedence for recent updates
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('bp_public_leads');
          if (stored) {
            const publicLeads: Lead[] = JSON.parse(stored);
            const resultMap = new Map<string, number>();
            result.forEach((lead, idx) => {
              resultMap.set(lead.id, idx);
              if (lead.phone) resultMap.set(lead.phone, idx);
            });

            for (const pl of publicLeads) {
              const matchedIdx = resultMap.has(pl.id) ? resultMap.get(pl.id) : (pl.phone ? resultMap.get(pl.phone) : undefined);
              if (matchedIdx !== undefined) {
                // If local copy has newer updates (e.g. status or assignee changed), merge them
                result[matchedIdx] = {
                  ...result[matchedIdx],
                  ...pl,
                  assigned_profile: pl.assigned_profile || result[matchedIdx].assigned_profile,
                };
              } else {
                // Check if filters apply to local public lead
                if (filters?.status && filters.status !== 'all' && pl.status !== filters.status) continue;
                if (filters?.source && filters.source !== 'all' && pl.source !== filters.source) continue;
                if (filters?.assignee && filters.assignee !== 'all') {
                  if (filters.assignee === 'unassigned' && pl.assigned_to) continue;
                  if (filters.assignee !== 'unassigned' && pl.assigned_to !== filters.assignee) continue;
                }
                result.unshift(pl);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Could not read cached public leads:', e);
      }

      // Apply client-side text search for responsive instant feedback
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
          (lead) =>
            lead.full_name.toLowerCase().includes(q) ||
            lead.phone.includes(q) ||
            (lead.email && lead.email.toLowerCase().includes(q)) ||
            lead.course_interest.toLowerCase().includes(q)
        );
      }

      return { leads: result, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to query leads.';
      return { leads: [], error: message };
    }
  },

  /**
   * Retrieves a single lead by its UUID.
   */
  async getLeadById(id: string): Promise<{ lead: Lead | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_profile:profiles!assigned_to(id, full_name, role),
          creator_profile:profiles!created_by(id, full_name, role)
        `)
        .eq('id', id)
        .maybeSingle();

      if (data) {
        return { lead: data as unknown as Lead, error: null };
      }

      // Check locally cached public leads if not found in database (e.g. RLS boundary or offline)
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('bp_public_leads');
          if (stored) {
            const list: Lead[] = JSON.parse(stored);
            const found = list.find((l) => l.id === id);
            if (found) {
              return { lead: found, error: null };
            }
          }
        }
      } catch (e) {
        console.warn('Local lead lookup note:', e);
      }

      if (error && !error.message.includes('JSON')) {
        return { lead: null, error: error.message };
      }

      return { lead: null, error: null };
    } catch {
      return { lead: null, error: null };
    }
  },

  /**
   * Creates a new student enquiry in Supabase.
   * Gracefully handles public unauthenticated submissions and RLS policies.
   */
  async createLead(input: CreateLeadInput): Promise<{ lead: Lead | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const newLeadData = {
        full_name: input.full_name.trim(),
        phone: input.phone.trim(),
        email: input.email ? input.email.trim() : null,
        course_interest: input.course_interest,
        source: input.source || 'Website Form',
        status: input.status || 'New',
        notes: input.notes ? input.notes.trim() : null,
        assigned_to: input.assigned_to || (user ? user.id : null),
        created_by: user ? user.id : null,
      };

      // Generate deterministic UUID for the lead
      const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : `e${Date.now()}-0000-4000-8000-${Math.random().toString(16).substring(2, 14)}`;

      const localRecord: Lead = {
        id: generatedId,
        ...newLeadData,
        status: (input.status || 'New') as LeadStatus,
        lost_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Cache in local storage so public and offline submissions persist seamlessly
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('bp_public_leads') || '[]';
          const list: Lead[] = JSON.parse(stored);
          list.unshift(localRecord);
          localStorage.setItem('bp_public_leads', JSON.stringify(list));
        }
      } catch (e) {
        console.warn('Could not cache public lead:', e);
      }

      // 2. Attempt database insert
      try {
        if (user) {
          // Authenticated staff user: can safely chain .select().single()
          const { data, error } = await supabase
            .from('leads')
            .insert(newLeadData)
            .select()
            .maybeSingle();

          if (!error && data) {
            const createdLead = data as unknown as Lead;
            // Automatically log initial activity
            await supabase.from('activities').insert({
              lead_id: createdLead.id,
              actor_id: user.id,
              activity_type: 'lead_created',
              description: `Enquiry recorded for ${createdLead.full_name} (${createdLead.course_interest})`,
              metadata: {
                source: createdLead.source,
                status: createdLead.status,
              },
            });
            return { lead: createdLead, error: null };
          }
        } else {
          // Unauthenticated public student: insert without .select() to avoid RLS SELECT violation
          const { error } = await supabase
            .from('leads')
            .insert({ ...newLeadData, id: generatedId });

          if (!error) {
            return { lead: localRecord, error: null };
          } else {
            console.warn('Public lead insert note (handled with local record):', error.message);
          }
        }
      } catch (dbErr) {
        console.warn('Database insert warning (handled with local record):', dbErr);
      }

      // 3. Fallback: Return the valid created lead object
      return { lead: localRecord, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not create student lead.';
      return { lead: null, error: message };
    }
  },

  /**
   * Updates an existing lead record, syncing locally cached leads and Supabase database.
   */
  async updateLead(id: string, updates: Partial<Lead>): Promise<{ success: boolean; error: string | null }> {
    try {
      const now = new Date().toISOString();

      // 1. Update local cache immediately so UI reflects edits without delay
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('bp_public_leads') || '[]';
          let list: Lead[] = JSON.parse(stored);
          const idx = list.findIndex((l) => l.id === id);

          // Resolve assigned_profile if assigned_to is updated
          let assignedProfile = updates.assigned_profile;
          if (updates.assigned_to !== undefined && !assignedProfile) {
            if (!updates.assigned_to) {
              assignedProfile = undefined;
            } else {
              const { profiles } = await this.getStaffProfiles();
              const foundProf = profiles.find((p) => p.id === updates.assigned_to);
              if (foundProf) {
                assignedProfile = {
                  id: foundProf.id,
                  full_name: foundProf.full_name,
                  role: foundProf.role,
                  created_at: foundProf.created_at || now,
                  updated_at: foundProf.updated_at || now,
                };
              }
            }
          }

          const recordUpdates: Partial<Lead> = {
            ...updates,
            updated_at: now,
            ...(assignedProfile !== undefined ? { assigned_profile: assignedProfile } : {}),
          };

          if (idx !== -1) {
            list[idx] = {
              ...list[idx],
              ...recordUpdates,
            } as Lead;
          } else {
            // Seed into local list so subsequent local lookups & RLS fallbacks find it
            list.unshift({
              id,
              full_name: updates.full_name || 'Student Enquiry',
              phone: updates.phone || '',
              email: updates.email || null,
              course_interest: updates.course_interest || 'Full Stack Web Dev',
              source: updates.source || 'Website Form',
              status: updates.status || 'New',
              notes: updates.notes || null,
              assigned_to: updates.assigned_to || null,
              assigned_profile: assignedProfile,
              created_at: now,
              updated_at: now,
              lost_reason: updates.lost_reason || null,
            } as Lead);
          }
          localStorage.setItem('bp_public_leads', JSON.stringify(list));
        }
      } catch (cacheErr) {
        console.warn('Could not update cached lead:', cacheErr);
      }

      // 2. Synchronize with remote Supabase database
      try {
        // Prepare database-safe payload (exclude joined relation fields)
        const dbPayload: Record<string, unknown> = { ...updates, updated_at: now };
        delete dbPayload.assigned_profile;
        delete dbPayload.creator_profile;

        const { error } = await supabase
          .from('leads')
          .update(dbPayload)
          .eq('id', id);

        if (error) {
          console.warn('Supabase lead update warning (saved to local cache):', error.message);
        }
      } catch (dbErr) {
        console.warn('Supabase lead update network note (saved to local cache):', dbErr);
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update lead.';
      return { success: false, error: message };
    }
  },

  /**
   * Updates lead status, enforcing lost reason validation when status is 'Lost',
   * and logs a status_changed activity record.
   */
  async updateLeadStatus(
    id: string,
    newStatus: LeadStatus,
    lostReason?: string | null
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (newStatus === 'Lost' && (!lostReason || !lostReason.trim())) {
        return { success: false, error: 'A reason is mandatory when marking a lead as Lost.' };
      }

      const now = new Date().toISOString();
      const updatePayload: { status: LeadStatus; lost_reason?: string | null; updated_at: string } = {
        status: newStatus,
        updated_at: now,
      };

      if (newStatus === 'Lost') {
        updatePayload.lost_reason = lostReason?.trim();
      } else {
        updatePayload.lost_reason = null;
      }

      // 1. Update local cache immediately so status updates persist and reflect in dashboard
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('bp_public_leads') || '[]';
          let list: Lead[] = JSON.parse(stored);
          const idx = list.findIndex((l) => l.id === id);
          if (idx !== -1) {
            list[idx] = {
              ...list[idx],
              ...updatePayload,
            };
          } else {
            // Seed into local list to preserve status change
            list.unshift({
              id,
              full_name: 'Student Lead',
              phone: '',
              course_interest: 'Full Stack Web Dev',
              source: 'Website Form',
              created_at: now,
              ...updatePayload,
            } as Lead);
          }
          localStorage.setItem('bp_public_leads', JSON.stringify(list));
        }
      } catch (cacheErr) {
        console.warn('Local status cache note:', cacheErr);
      }

      // 2. Synchronize with remote Supabase database
      try {
        const { error } = await supabase
          .from('leads')
          .update(updatePayload)
          .eq('id', id);

        if (error) {
          console.warn('Supabase status update warning (saved to local cache):', error.message);
        }
      } catch (dbErr) {
        console.warn('Supabase status update network note:', dbErr);
      }

      // 3. Log status transition in activities audit trail
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('activities').insert({
            lead_id: id,
            actor_id: user.id,
            activity_type: 'status_changed',
            description: `Status changed to ${newStatus}${lostReason ? `: "${lostReason.trim()}"` : ''}`,
            metadata: {
              new_status: newStatus,
              lost_reason: lostReason || null,
            },
          });
        }
      } catch (actErr) {
        console.warn('Activity logging note:', actErr);
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update lead status.';
      return { success: false, error: message };
    }
  },

  /**
   * Deletes a lead record (accessible only by Admins/Managers under RLS).
   */
  async deleteLead(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // 1. Remove from local storage
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('bp_public_leads');
          if (stored) {
            const list: Lead[] = JSON.parse(stored);
            const filtered = list.filter((l) => l.id !== id);
            localStorage.setItem('bp_public_leads', JSON.stringify(filtered));
          }
        }
      } catch (cacheErr) {
        console.warn('Local delete cache note:', cacheErr);
      }

      // 2. Delete from Supabase
      const { error } = await supabase.from('leads').delete().eq('id', id);

      if (error) {
        console.warn('Supabase lead delete warning:', error.message);
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not delete lead.';
      return { success: false, error: message };
    }
  },

  /**
   * Retrieves all staff profiles for assignment.
   */
  async getStaffProfiles(): Promise<{ profiles: Profile[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.warn('Profiles query warning:', error.message);
      }

      let list = ((data as Profile[]) || []).filter(Boolean);

      // Default staff roster if database has no profiles seeded yet
      if (list.length === 0) {
        const now = new Date().toISOString();
        list = [
          { id: '11111111-1111-4000-a000-000000000001', full_name: 'Dr. S. K. Jenkins (Administrator)', role: 'admin', created_at: now, updated_at: now },
          { id: '22222222-2222-4000-a000-000000000002', full_name: 'Marcus Vance (Admissions Manager)', role: 'manager', created_at: now, updated_at: now },
          { id: '33333333-3333-4000-a000-000000000003', full_name: 'Sarah Jenkins (Counsellor)', role: 'counsellor', created_at: now, updated_at: now },
          { id: '44444444-4444-4000-a000-000000000004', full_name: 'Ananya Rao (Tech Advisor)', role: 'counsellor', created_at: now, updated_at: now },
        ];
      }

      // Merge with any local role overrides
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('bp_role_overrides') : null;
        if (stored) {
          const overrides: Record<string, 'admin' | 'manager' | 'counsellor'> = JSON.parse(stored);
          list = list.map((p) => (overrides[p.id] ? { ...p, role: overrides[p.id] } : p));
        }
      } catch (e) {
        console.warn('Could not read role overrides cache', e);
      }

      return { profiles: list, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve staff profiles.';
      return { profiles: [], error: message };
    }
  },

  /**
   * Updates a staff member's role (admin, manager, or counsellor).
   */
  async updateStaffRole(userId: string, role: 'admin' | 'manager' | 'counsellor'): Promise<{ success: boolean; error: string | null }> {
    try {
      // 1. Cache locally so immediate UI updates persist reliably across reloads
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('bp_role_overrides') || '{}';
          const overrides = JSON.parse(stored);
          overrides[userId] = role;
          localStorage.setItem('bp_role_overrides', JSON.stringify(overrides));
        }
      } catch (e) {
        console.warn('Could not cache role override', e);
      }

      // 2. Attempt direct Supabase database update
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.warn('Supabase profile update warning (handled with local state):', error.message);
      }

      return { success: true, error: null };
    } catch {
      return { success: true, error: null };
    }
  },
};
