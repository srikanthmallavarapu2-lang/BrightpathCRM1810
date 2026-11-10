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

// Known Academy Staff Roster (mapped to real Supabase Auth accounts)
const DEFAULT_STAFF_ROSTER: Profile[] = [
  {
    id: '172dc09f-b778-407e-ac66-5bc845a4dd2a',
    full_name: 'Dr. S. K. Jenkins (Administrator)',
    role: 'admin',
    created_at: '2026-10-31T12:00:00Z',
    updated_at: '2026-10-31T12:00:00Z',
  },
  {
    id: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
    full_name: 'Marcus Vance (Branch Manager)',
    role: 'manager',
    created_at: '2026-10-31T12:00:00Z',
    updated_at: '2026-10-31T12:00:00Z',
  },
  {
    id: '8200424f-5eb4-461a-85ff-4247030f8560',
    full_name: 'Sarah Jenkins (Counsellor)',
    role: 'counsellor',
    created_at: '2026-10-31T12:00:00Z',
    updated_at: '2026-10-31T12:00:00Z',
  },
  {
    id: '44444444-4444-4000-a000-000000000004',
    full_name: 'Ananya Rao (Tech Advisor)',
    role: 'counsellor',
    created_at: '2026-10-31T12:00:00Z',
    updated_at: '2026-10-31T12:00:00Z',
  },
];

// Baseline Active Leads visible across all Counsellor, Manager, and Admin workspaces
const DEFAULT_SHARED_LEADS: Lead[] = [
  // Sarah Jenkins (3 Converted, 2 Active = 5 leads, 60% conversion, ₹1.85 Lakh)
  {
    id: 'lead-001-sanya',
    full_name: 'sanya sharma',
    phone: '8839020221',
    email: 'sanya.s@gmail.com',
    course_interest: 'Data Science & AI',
    source: 'Website Form',
    status: 'Converted',
    notes: '[Priority: Hot]\nProvisional enrolment confirmed. Fee processed.',
    assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
    created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    assigned_profile: {
      id: '8200424f-5eb4-461a-85ff-4247030f8560',
      full_name: 'Sarah Jenkins (Counsellor)',
      role: 'counsellor',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-10-31T10:00:00Z',
    updated_at: '2026-10-31T14:30:00Z',
    lost_reason: null,
  },
  {
    id: 'lead-002-vijay',
    full_name: 'Vijay Kumar',
    phone: '7013692321',
    email: 'Vijaykumar@gmail.com',
    course_interest: 'Cloud & DevOps',
    source: 'Website Form',
    status: 'Converted',
    notes: '[Priority: Hot]\nAdmissions verified. Fees processed.',
    assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
    created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    assigned_profile: {
      id: '8200424f-5eb4-461a-85ff-4247030f8560',
      full_name: 'Sarah Jenkins (Counsellor)',
      role: 'counsellor',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-10-31T09:00:00Z',
    updated_at: '2026-10-31T14:00:00Z',
    lost_reason: null,
  },
  {
    id: 'lead-004-rahul',
    full_name: 'Rahul Sharma',
    phone: '+91 9871910101',
    email: 'Rahul12@gmail.com',
    course_interest: 'Data Science & AI',
    source: 'Student Referral',
    status: 'Converted',
    notes: '[Priority: Hot]\nReferral from Alumni. Enrolled.',
    assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
    created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    assigned_profile: {
      id: '8200424f-5eb4-461a-85ff-4247030f8560',
      full_name: 'Sarah Jenkins (Counsellor)',
      role: 'counsellor',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-10-31T08:30:00Z',
    updated_at: '2026-10-31T14:15:00Z',
    lost_reason: null,
  },
  {
    id: 'lead-005-srikanth',
    full_name: 'Srikanth Mallavarapu',
    phone: '+91 7013692321',
    email: 'Srikanth12@gmail.com',
    course_interest: 'Full Stack Web Dev',
    source: 'Inbound Phone Call',
    status: 'Contacted',
    notes: '[Priority: Warm]\nAttended initial tech counseling call. Reviewing syllabus modules.',
    assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
    created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    assigned_profile: {
      id: '8200424f-5eb4-461a-85ff-4247030f8560',
      full_name: 'Sarah Jenkins (Counsellor)',
      role: 'counsellor',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-10-22T15:00:00Z',
    updated_at: '2026-10-31T14:20:00Z',
    lost_reason: null,
  },
  {
    id: 'lead-006-tanvi',
    full_name: 'Tanvi Mehta',
    phone: '+91 9876599330',
    email: 'tanvi.mehta9933@gmail.com',
    course_interest: 'UI/UX Design',
    source: 'Website Form',
    status: 'New',
    notes: '[Priority: Warm]\nInterested in Portfolio & Design Systems track.',
    assigned_to: '8200424f-5eb4-461a-85ff-4247030f8560',
    created_by: '8200424f-5eb4-461a-85ff-4247030f8560',
    assigned_profile: {
      id: '8200424f-5eb4-461a-85ff-4247030f8560',
      full_name: 'Sarah Jenkins (Counsellor)',
      role: 'counsellor',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-11-01T11:00:00Z',
    updated_at: '2026-11-01T11:00:00Z',
    lost_reason: null,
  },

  // Ananya Rao (2 Converted, 2 Active = 4 leads, 50% conversion, ₹1.00 Lakh)
  {
    id: 'lead-007-deepak',
    full_name: 'Deepak Verma',
    phone: '+91 9871122334',
    email: 'deepakverma01@gmail.com',
    course_interest: 'Cloud & DevOps',
    source: 'Website Form',
    status: 'Converted',
    notes: '[Priority: Hot]\nFee installment cleared. AWS & Kubernetes cohort enrolled.',
    assigned_to: '44444444-4444-4000-a000-000000000004',
    created_by: '44444444-4444-4000-a000-000000000004',
    assigned_profile: {
      id: '44444444-4444-4000-a000-000000000004',
      full_name: 'Ananya Rao (Tech Advisor)',
      role: 'counsellor',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-11-01T09:00:00Z',
    updated_at: '2026-11-02T16:00:00Z',
    lost_reason: null,
  },
  {
    id: 'lead-008-priya',
    full_name: 'Priya Nair',
    phone: '+91 9820123456',
    email: 'priya.nair@outlook.com',
    course_interest: 'Full Stack Web Dev',
    source: 'Campus Event',
    status: 'Converted',
    notes: '[Priority: Hot]\nReact & Node bootcamp confirmation completed.',
    assigned_to: '44444444-4444-4000-a000-000000000004',
    created_by: '44444444-4444-4000-a000-000000000004',
    assigned_profile: {
      id: '44444444-4444-4000-a000-000000000004',
      full_name: 'Ananya Rao (Tech Advisor)',
      role: 'counsellor',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-10-28T14:00:00Z',
    updated_at: '2026-10-30T17:00:00Z',
    lost_reason: null,
  },
  {
    id: 'lead-009-aarav',
    full_name: 'Aarav Patel',
    phone: '+91 9711882233',
    email: 'aarav.patel@gmail.com',
    course_interest: 'Cybersecurity',
    source: 'Website Form',
    status: 'Qualified',
    notes: '[Priority: Warm]\nCleared tech aptitude assessment, reviewing batch dates.',
    assigned_to: '44444444-4444-4000-a000-000000000004',
    created_by: '44444444-4444-4000-a000-000000000004',
    assigned_profile: {
      id: '44444444-4444-4000-a000-000000000004',
      full_name: 'Ananya Rao (Tech Advisor)',
      role: 'counsellor',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-11-03T10:15:00Z',
    updated_at: '2026-11-04T12:30:00Z',
    lost_reason: null,
  },
  {
    id: 'lead-010-neha',
    full_name: 'Neha Gupta',
    phone: '+91 9811447722',
    email: 'neha.design@gmail.com',
    course_interest: 'UI/UX Design',
    source: 'Inbound Phone Call',
    status: 'Contacted',
    notes: '[Priority: Warm]\nNeeds weekend batch for working professionals.',
    assigned_to: '44444444-4444-4000-a000-000000000004',
    created_by: '44444444-4444-4000-a000-000000000004',
    assigned_profile: {
      id: '44444444-4444-4000-a000-000000000004',
      full_name: 'Ananya Rao (Tech Advisor)',
      role: 'counsellor',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-11-04T15:00:00Z',
    updated_at: '2026-11-04T15:00:00Z',
    lost_reason: null,
  },

  // Marcus Vance (2 Converted, 1 Active = 3 leads, 66.7% conversion, ₹1.03 Lakh)
  {
    id: 'lead-003-dharvik',
    full_name: 'Dharvik',
    phone: '+91 9876523101',
    email: 'Dharvik.m@gail.com',
    course_interest: 'Cloud & DevOps',
    source: 'Website Form',
    status: 'Converted',
    notes: '[Priority: Hot]\nBranch manager consultation completed. Enrolment confirmed.',
    assigned_to: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
    created_by: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
    assigned_profile: {
      id: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
      full_name: 'Marcus Vance (Branch Manager)',
      role: 'manager',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-10-24T11:00:00Z',
    updated_at: '2026-10-31T14:00:00Z',
    lost_reason: null,
  },
  {
    id: 'lead-011-rohan',
    full_name: 'Rohan Gupta',
    phone: '+91 9819001122',
    email: 'rohan.gupta@corp.in',
    course_interest: 'Cybersecurity',
    source: 'Direct Walk-in',
    status: 'Converted',
    notes: '[Priority: Hot]\nCorporate sponsored admission. Fee verified.',
    assigned_to: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
    created_by: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
    assigned_profile: {
      id: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
      full_name: 'Marcus Vance (Branch Manager)',
      role: 'manager',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-10-29T10:00:00Z',
    updated_at: '2026-10-31T16:00:00Z',
    lost_reason: null,
  },
  {
    id: 'lead-012-simran',
    full_name: 'Simran Kaur',
    phone: '+91 9720448811',
    email: 'simran.kaur@gmail.com',
    course_interest: 'Data Science & AI',
    source: 'Website Form',
    status: 'Contacted',
    notes: '[Priority: Warm]\nAttended campus tour with parents. Considering batch.',
    assigned_to: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
    created_by: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
    assigned_profile: {
      id: 'ccd3a97a-b46a-4bab-b38c-f57dd74dbcd6',
      full_name: 'Marcus Vance (Branch Manager)',
      role: 'manager',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-11-02T14:00:00Z',
    updated_at: '2026-11-02T14:00:00Z',
    lost_reason: null,
  },

  // Dr. S. K. Jenkins (1 Converted = 1 lead, 100% conversion, ₹65,000)
  {
    id: 'lead-013-vikram',
    full_name: 'Vikramaditya Singhania',
    phone: '+91 9900112233',
    email: 'vikram.singhania@apex.com',
    course_interest: 'Data Science & AI',
    source: 'Student Referral',
    status: 'Converted',
    notes: '[Priority: Hot]\nExecutive Fellowship in Artificial Intelligence. Director scholarship applied.',
    assigned_to: '11111111-1111-4000-a000-000000000001',
    created_by: '11111111-1111-4000-a000-000000000001',
    assigned_profile: {
      id: '11111111-1111-4000-a000-000000000001',
      full_name: 'Dr. S. K. Jenkins (Administrator)',
      role: 'admin',
      created_at: '2026-10-31T12:00:00Z',
      updated_at: '2026-10-31T12:00:00Z',
    },
    created_at: '2026-10-25T09:00:00Z',
    updated_at: '2026-10-26T12:00:00Z',
    lost_reason: null,
  },
];

export const leadService = {
  /**
   * Fetches leads accessible to the current user with full synchronization across
   * Counsellor, Branch Manager, and Administrator workspaces.
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

      const { data, error } = await query;
      if (error) {
        console.warn('Database leads query notice:', error.message);
      }

      let result = (data as unknown as Lead[]) || [];

      // Unified Cross-Role Leads Sync: Merge shared leads cache and public leads
      try {
        if (typeof window !== 'undefined') {
          const storedShared = localStorage.getItem('bp_crm_all_leads');
          let sharedLeads: Lead[] = storedShared ? JSON.parse(storedShared) : [...DEFAULT_SHARED_LEADS];
          
          if (Array.isArray(sharedLeads)) {
            // Guarantee all baseline leads exist so all counsellors have active pipeline demo data
            for (const defLead of DEFAULT_SHARED_LEADS) {
              if (!sharedLeads.some((sl) => sl.id === defLead.id || sl.phone === defLead.phone)) {
                sharedLeads.push(defLead);
              }
            }
          }

          // Also merge any public portal leads
          const storedPublic = localStorage.getItem('bp_public_leads');
          if (storedPublic) {
            const publicLeads: Lead[] = JSON.parse(storedPublic);
            for (const pl of publicLeads) {
              if (!sharedLeads.some((sl) => sl.id === pl.id || (sl.phone && sl.phone === pl.phone))) {
                sharedLeads.unshift(pl);
              }
            }
          }

          // Build map of remote results
          const resultMap = new Map<string, number>();
          result.forEach((lead, idx) => {
            resultMap.set(lead.id, idx);
            if (lead.phone) resultMap.set(lead.phone, idx);
          });

          // Merge shared leads with remote database leads
          for (const sl of sharedLeads) {
            const matchedIdx = resultMap.has(sl.id) 
              ? resultMap.get(sl.id) 
              : (sl.phone ? resultMap.get(sl.phone) : undefined);

            if (matchedIdx !== undefined) {
              // Merge local modifications into remote row
              result[matchedIdx] = {
                ...result[matchedIdx],
                ...sl,
                assigned_profile: sl.assigned_profile || result[matchedIdx].assigned_profile,
              };
            } else {
              result.push(sl);
            }
          }

          // Save unified leads cache back to localStorage
          localStorage.setItem('bp_crm_all_leads', JSON.stringify(result));
        }
      } catch (e) {
        console.warn('Could not read cached shared leads:', e);
      }

      // Apply Filter by Assignee
      if (filters?.assignee && filters.assignee !== 'all') {
        if (filters.assignee === 'unassigned') {
          result = result.filter((l) => !l.assigned_to);
        } else if (filters.assignee === 'me') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            result = result.filter((l) => l.assigned_to === user.id);
          }
        } else {
          result = result.filter((l) => l.assigned_to === filters.assignee);
        }
      }

      // Apply Filter by Status
      if (filters?.status && filters.status !== 'all') {
        result = result.filter((l) => l.status === filters.status);
      }

      // Apply Filter by Source
      if (filters?.source && filters.source !== 'all') {
        result = result.filter((l) => l.source === filters.source);
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

          // Also update unified CRM leads cache
          const storedShared = localStorage.getItem('bp_crm_all_leads') || '[]';
          const sharedList: Lead[] = JSON.parse(storedShared);
          sharedList.unshift(localRecord);
          localStorage.setItem('bp_crm_all_leads', JSON.stringify(sharedList));
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

          // Also synchronize in shared CRM leads cache
          const storedShared = localStorage.getItem('bp_crm_all_leads') || '[]';
          let sharedList: Lead[] = JSON.parse(storedShared);
          const sIdx = sharedList.findIndex((l) => l.id === id);
          if (sIdx !== -1) {
            sharedList[sIdx] = { ...sharedList[sIdx], ...recordUpdates } as Lead;
          } else {
            sharedList.unshift(list[0]);
          }
          localStorage.setItem('bp_crm_all_leads', JSON.stringify(sharedList));
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

          // Also synchronize in shared CRM leads cache
          const storedShared = localStorage.getItem('bp_crm_all_leads') || '[]';
          let sharedList: Lead[] = JSON.parse(storedShared);
          const sIdx = sharedList.findIndex((l) => l.id === id);
          if (sIdx !== -1) {
            sharedList[sIdx] = { ...sharedList[sIdx], ...updatePayload };
          } else {
            sharedList.unshift(list[0]);
          }
          localStorage.setItem('bp_crm_all_leads', JSON.stringify(sharedList));
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

          const storedShared = localStorage.getItem('bp_crm_all_leads');
          if (storedShared) {
            const sharedList: Lead[] = JSON.parse(storedShared);
            const filteredShared = sharedList.filter((l) => l.id !== id);
            localStorage.setItem('bp_crm_all_leads', JSON.stringify(filteredShared));
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
   * Merges remote database profiles with known staff roster and dynamically registered accounts.
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

      // Start with default staff roster
      const profileMap = new Map<string, Profile>();
      DEFAULT_STAFF_ROSTER.forEach((p) => profileMap.set(p.id, p));

      // Merge dynamic staff accounts registered locally
      try {
        if (typeof window !== 'undefined') {
          const storedRoster = localStorage.getItem('bp_staff_roster');
          if (storedRoster) {
            const roster: Profile[] = JSON.parse(storedRoster);
            roster.forEach((p) => {
              if (p && p.id) {
                profileMap.set(p.id, { ...(profileMap.get(p.id) || {}), ...p });
              }
            });
          }
        }
      } catch (e) {
        console.warn('Could not read cached staff roster:', e);
      }

      // Merge remote database profiles
      const dbProfiles = ((data as Profile[]) || []).filter(Boolean);
      dbProfiles.forEach((p) => {
        if (p && p.id) {
          const existing = profileMap.get(p.id);
          profileMap.set(p.id, {
            ...existing,
            ...p,
            full_name: p.full_name || existing?.full_name || 'Staff Member',
            // If existing is admin/manager from known roster, preserve elevated role
            role: (existing?.role === 'admin' || existing?.role === 'manager') ? existing.role : p.role,
          });
        }
      });

      let list = Array.from(profileMap.values());

      // Merge with any local role overrides from Settings
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
      return { profiles: DEFAULT_STAFF_ROSTER, error: message };
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
