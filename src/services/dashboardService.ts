import { supabase } from '../lib/supabaseClient';
import { FollowUp, LeadStatus } from '../types/database';

export interface DashboardMetrics {
  totalLeads: number;
  newEnquiries: number;
  convertedLeads: number;
  overdueFollowUps: number;
  conversionRate: number;
  addedToday: number;
  statusDistribution: Array<{
    label: LeadStatus;
    count: number;
    percentage: number;
    color: string;
  }>;
  sourceDistribution: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
}

export const dashboardService = {
  /**
   * Calculates live dashboard metrics from accessible Supabase records under RLS.
   */
  async getMetrics(): Promise<{ metrics: DashboardMetrics; error: string | null }> {
    try {
      // 1. Fetch leads from database
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, status, source, created_at');

      if (leadsError) {
        console.warn('Dashboard leads query notice (merging local cache):', leadsError.message);
      }

      let leads: Array<{ id: string; status: string; source: string; created_at: string }> = leadsData ? [...leadsData] : [];

      // Merge cached public / locally-persisted leads so KPIs 100% reconcile with the pipeline table
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('bp_public_leads');
          if (stored) {
            const publicLeads: Array<{ id: string; status: string; source?: string; created_at?: string }> = JSON.parse(stored);
            const existingMap = new Map<string, number>();
            leads.forEach((l, idx) => existingMap.set(l.id, idx));

            for (const pl of publicLeads) {
              if (existingMap.has(pl.id)) {
                // If local copy has updated status or source, update in array
                const idx = existingMap.get(pl.id)!;
                leads[idx] = {
                  ...leads[idx],
                  status: pl.status || leads[idx].status,
                  source: pl.source || leads[idx].source,
                };
              } else {
                leads.push({
                  id: pl.id,
                  status: pl.status || 'New',
                  source: pl.source || 'Website Form',
                  created_at: pl.created_at || new Date().toISOString(),
                });
              }
            }
          }
        }
      } catch (cacheErr) {
        console.warn('Dashboard local lead merge warning:', cacheErr);
      }

      const totalLeads = leads.length;

      // 2. Fetch overdue follow-ups count
      const now = new Date().toISOString();
      const { count: overdueCount, error: followUpsError } = await supabase
        .from('follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('due_at', now);

      if (followUpsError) {
        console.warn('Could not query overdue follow_ups count:', followUpsError.message);
      }

      const overdueFollowUps = overdueCount || 0;

      // 3. Status breakdown
      const statusCounts: Record<LeadStatus, number> = {
        New: 0,
        Contacted: 0,
        Qualified: 0,
        Converted: 0,
        Lost: 0,
      };

      // 4. Source breakdown
      const sourceCounts: Record<string, number> = {};

      // 5. Leads created today (in user's local day)
      const todayString = new Date().toISOString().split('T')[0];
      let addedToday = 0;

      for (const lead of leads) {
        const s = lead.status as LeadStatus;
        if (statusCounts[s] !== undefined) {
          statusCounts[s] += 1;
        }

        const src = lead.source || 'Other';
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;

        if (lead.created_at && lead.created_at.startsWith(todayString)) {
          addedToday += 1;
        }
      }

      const newEnquiries = statusCounts.New;
      const convertedLeads = statusCounts.Converted;
      const conversionRate = totalLeads > 0 
        ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) 
        : 0;

      const statusColors: Record<LeadStatus, string> = {
        New: '#3b82f6',
        Contacted: '#8b5cf6',
        Qualified: '#f59e0b',
        Converted: '#10b981',
        Lost: '#ef4444',
      };

      const statusDistribution: DashboardMetrics['statusDistribution'] = (
        ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] as LeadStatus[]
      ).map((st) => {
        const count = statusCounts[st] || 0;
        const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
        return {
          label: st,
          count,
          percentage,
          color: statusColors[st],
        };
      });

      // Standard sources + any dynamic ones discovered
      const defaultSources = ['Website Form', 'Walk-in Visit', 'Inbound Phone Call', 'Student Referral'];
      const allSourceKeys = Array.from(new Set([...defaultSources, ...Object.keys(sourceCounts)]));
      const sourceDistribution: DashboardMetrics['sourceDistribution'] = allSourceKeys.map((src) => {
        const count = sourceCounts[src] || 0;
        const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
        return {
          label: src,
          count,
          percentage,
        };
      });

      return {
        metrics: {
          totalLeads,
          newEnquiries,
          convertedLeads,
          overdueFollowUps,
          conversionRate,
          addedToday,
          statusDistribution,
          sourceDistribution,
        },
        error: null,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to calculate dashboard metrics.';
      return {
        metrics: getDefaultMetrics(),
        error: message,
      };
    }
  },

  /**
   * Fetches top overdue follow-up tasks (status = pending and due_at < now),
   * ordered by oldest due first, with joined lead information.
   */
  async getTopOverdueFollowUps(limit: number = 5): Promise<{ followUps: FollowUp[]; error: string | null }> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('follow_ups')
        .select(`
          *,
          lead:leads(id, full_name, phone, course_interest, status),
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `)
        .eq('status', 'pending')
        .lt('due_at', now)
        .order('due_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching top overdue follow-ups:', error.message);
        return { followUps: [], error: error.message };
      }

      return { followUps: (data as unknown as FollowUp[]) || [], error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve top overdue follow-ups.';
      return { followUps: [], error: message };
    }
  },
};

function getDefaultMetrics(): DashboardMetrics {
  return {
    totalLeads: 0,
    newEnquiries: 0,
    convertedLeads: 0,
    overdueFollowUps: 0,
    conversionRate: 0,
    addedToday: 0,
    statusDistribution: [
      { label: 'New', count: 0, percentage: 0, color: '#3b82f6' },
      { label: 'Contacted', count: 0, percentage: 0, color: '#8b5cf6' },
      { label: 'Qualified', count: 0, percentage: 0, color: '#f59e0b' },
      { label: 'Converted', count: 0, percentage: 0, color: '#10b981' },
      { label: 'Lost', count: 0, percentage: 0, color: '#ef4444' },
    ],
    sourceDistribution: [
      { label: 'Website Form', count: 0, percentage: 0 },
      { label: 'Walk-in Visit', count: 0, percentage: 0 },
      { label: 'Inbound Phone Call', count: 0, percentage: 0 },
      { label: 'Student Referral', count: 0, percentage: 0 },
    ],
  };
}
