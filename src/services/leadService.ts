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
        .single();

      if (error) {
        return { lead: null, error: error.message };
      }

      return { lead: data as unknown as Lead, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve lead details.';
      return { lead: null, error: message };
    }
  },

  /**
   * Creates a new student enquiry in Supabase.
   * Tags the record with created_by = auth.uid() and records initial activity.
   */
  async createLead(input: CreateLeadInput): Promise<{ lead: Lead | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const newLeadData = {
        full_name: input.full_name.trim(),
        phone: input.phone.trim(),
        email: input.email ? input.email.trim() : null,
        course_interest: input.course_interest,
        source: input.source,
        status: input.status || 'New',
        notes: input.notes ? input.notes.trim() : null,
        assigned_to: input.assigned_to || (user ? user.id : null),
        created_by: user ? user.id : null,
      };

      const { data, error } = await supabase
        .from('leads')
        .insert(newLeadData)
        .select()
        .single();

      if (error) {
        return { lead: null, error: error.message };
      }

      const createdLead = data as unknown as Lead;

      // Automatically log initial activity
      if (createdLead && user) {
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
      }

      return { lead: createdLead, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not create student lead.';
      return { lead: null, error: message };
    }
  },

  /**
   * Updates an existing lead record.
   */
  async updateLead(id: string, updates: Partial<Lead>): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
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

      const updatePayload: { status: LeadStatus; lost_reason?: string | null; updated_at: string } = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'Lost') {
        updatePayload.lost_reason = lostReason?.trim();
      } else {
        updatePayload.lost_reason = null;
      }

      const { error } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log status transition in activities audit trail
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
      const { error } = await supabase.from('leads').delete().eq('id', id);

      if (error) {
        return { success: false, error: error.message };
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
        return { profiles: [], error: error.message };
      }

      return { profiles: (data as Profile[]) || [], error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve staff profiles.';
      return { profiles: [], error: message };
    }
  },
};
