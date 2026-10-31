import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  ClockAlert, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  Database, 
  ArrowRight,
  AlertCircle,
  Globe
} from 'lucide-react';
import { dashboardService, DashboardMetrics } from '../../services/dashboardService';
import { followUpService } from '../../services/followUpService';
import { FollowUp, Lead, LeadStatus } from '../../types/database';
import { KPICard } from './KPICard';
import { StatusDistribution } from './StatusDistribution';
import { SourceDistribution } from './SourceDistribution';
import { ActionCenter } from './ActionCenter';
import { CounsellorLeaderboard } from './CounsellorLeaderboard';
import { PublicEnquiryModal } from '../simulator/PublicEnquiryModal';
import { LeadDetailModal } from '../leads/LeadDetailModal';
import { RescheduleModal } from '../followups/RescheduleModal';
import { useToast } from '../../context/ToastContext';

export interface DashboardViewProps {
  onNavigateToLeads: () => void;
  onNavigateToFollowUps: () => void;
  onNavigateToLeadsWithStatus?: (status: LeadStatus) => void;
  onNavigateToLeadsWithSource?: (source: string) => void;
  onOpenAssistant?: () => void;
  onOpenCreateLead?: () => void;
  onEditLead?: (lead: Lead) => void;
  onScheduleFollowUpForLead?: (lead: Lead) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToLeads,
  onNavigateToFollowUps,
  onNavigateToLeadsWithStatus,
  onNavigateToLeadsWithSource,
  onOpenAssistant,
  onOpenCreateLead,
  onEditLead,
  onScheduleFollowUpForLead,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topOverdue, setTopOverdue] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // In-dashboard modal states
  const [selectedLeadIdForDossier, setSelectedLeadIdForDossier] = useState<string | null>(null);
  const [rescheduleItem, setRescheduleItem] = useState<FollowUp | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const toast = useToast();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [metricsRes, overdueRes] = await Promise.all([
      dashboardService.getMetrics(),
      dashboardService.getTopOverdueFollowUps(5),
    ]);

    if (metricsRes.error) {
      setErrorMessage(metricsRes.error);
    } else {
      setMetrics(metricsRes.metrics);
    }

    setTopOverdue(overdueRes.followUps);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCompleteFollowUp = async (id: string) => {
    const { success, error } = await followUpService.completeFollowUp(id);
    if (success) {
      toast.success('Follow-up task completed.');
      await fetchDashboardData();
    } else {
      toast.error(error || 'Failed to complete follow-up task.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Real-time Live Operations Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(79, 70, 229, 0.04))',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div 
            style={{ 
              width: 42, 
              height: 42, 
              borderRadius: 'var(--radius-md)', 
              background: '#2563eb', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Live Admissions Pipeline &amp; KPI Engine</span>
              <span className="radar-dot connected" title="Supabase Database Live Connected" />
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Reconciled 100% in real-time with your permitted Supabase PostgreSQL records.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchDashboardData} 
            className="btn btn-outline" 
            title="Recalculate metrics from database"
            style={{ fontSize: '0.8rem', gap: '5px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>Sync KPIs</span>
          </button>

          <button 
            onClick={() => setIsSimulatorOpen(true)}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', gap: '5px', borderColor: '#a78bfa', color: '#6d28d9', background: '#faf5ff' }}
            title="Simulate live student website enquiry submission"
          >
            <Globe size={13} color="#7c3aed" />
            <span>Website Form Simulator</span>
          </button>

          {onOpenCreateLead && (
            <button onClick={onOpenCreateLead} className="btn btn-primary" style={{ fontSize: '0.8rem', gap: '5px' }}>
              <Plus size={14} />
              <span>Record Enquiry</span>
            </button>
          )}

          {onOpenAssistant && (
            <button onClick={onOpenAssistant} className="btn btn-outline" style={{ fontSize: '0.8rem', gap: '5px' }}>
              <Database size={13} color="#059669" />
              <span>Assistant</span>
            </button>
          )}

          <button onClick={onNavigateToLeads} className="btn btn-secondary" style={{ fontSize: '0.8rem', gap: '5px' }}>
            <span>View Leads</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Error state if query fails */}
      {errorMessage && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 5-Column High-Impact KPI Row */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* KPI 1: Total Leads */}
        <KPICard
          title="Total Leads"
          value={metrics?.totalLeads ?? 0}
          icon={Users}
          variant="blue"
          trendBadge={{
            text: `+${metrics?.addedToday ?? 0} added today`,
            positive: true,
          }}
          drilldownLabel="View all enquiries"
          onClick={onNavigateToLeads}
          isLoading={isLoading}
        />

        {/* KPI 2: New Enquiries */}
        <KPICard
          title="New Enquiries"
          value={metrics?.newEnquiries ?? 0}
          icon={Sparkles}
          variant="blue"
          subtitle="Needs initial phone outreach"
          drilldownLabel="Filter new leads"
          onClick={() => {
            if (onNavigateToLeadsWithStatus) {
              onNavigateToLeadsWithStatus('New');
            } else {
              onNavigateToLeads();
            }
          }}
          isLoading={isLoading}
        />

        {/* KPI 3: Converted Students */}
        <KPICard
          title="Converted"
          value={metrics?.convertedLeads ?? 0}
          icon={UserCheck}
          variant="success"
          subtitle="Enrolled admissions"
          drilldownLabel="Filter enrolled students"
          onClick={() => {
            if (onNavigateToLeadsWithStatus) {
              onNavigateToLeadsWithStatus('Converted');
            } else {
              onNavigateToLeads();
            }
          }}
          isLoading={isLoading}
        />

        {/* KPI 4: Overdue Follow-ups */}
        <KPICard
          title="Overdue Follow-ups"
          value={metrics?.overdueFollowUps ?? 0}
          icon={ClockAlert}
          variant={(metrics?.overdueFollowUps ?? 0) > 0 ? 'alert' : 'default'}
          subtitle={(metrics?.overdueFollowUps ?? 0) > 0 ? 'Urgent outreach required' : 'All reminders current'}
          drilldownLabel="Review overdue schedule"
          onClick={onNavigateToFollowUps}
          isLoading={isLoading}
        />

        {/* KPI 5: Conversion Rate */}
        <KPICard
          title="Conversion Rate"
          value={`${metrics?.conversionRate ?? 0}%`}
          icon={TrendingUp}
          variant="purple"
          subtitle="(Converted / Total) × 100"
          drilldownLabel="Pipeline efficiency pace"
          isLoading={isLoading}
        />
      </div>

      {/* Urgent Operational Action Center */}
      <ActionCenter
        followUps={topOverdue}
        isLoading={isLoading}
        onCompleteFollowUp={handleCompleteFollowUp}
        onRescheduleFollowUp={(item) => setRescheduleItem(item)}
        onViewLead={(leadId) => setSelectedLeadIdForDossier(leadId)}
        onNavigateToAllFollowUps={onNavigateToFollowUps}
      />

      {/* Two Column Layout: Pipeline Status Breakdown & Source Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <StatusDistribution
          statusDistribution={metrics?.statusDistribution || []}
          totalLeads={metrics?.totalLeads ?? 0}
          isLoading={isLoading}
          onSelectStatus={onNavigateToLeadsWithStatus}
        />

        <SourceDistribution
          sourceDistribution={metrics?.sourceDistribution || []}
          totalLeads={metrics?.totalLeads ?? 0}
          isLoading={isLoading}
          onSelectSource={onNavigateToLeadsWithSource}
        />
      </div>

      {/* Counsellor Conversion Leaderboard */}
      <CounsellorLeaderboard />

      {/* Public Website Enquiry Simulator Modal */}
      <PublicEnquiryModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onLeadIngested={fetchDashboardData}
      />

      {/* Student Dossier Modal opened directly from Action Center */}
      <LeadDetailModal
        isOpen={Boolean(selectedLeadIdForDossier)}
        onClose={() => setSelectedLeadIdForDossier(null)}
        leadId={selectedLeadIdForDossier}
        onLeadUpdated={fetchDashboardData}
        onScheduleFollowUp={(lead) => {
          setSelectedLeadIdForDossier(null);
          if (onScheduleFollowUpForLead) onScheduleFollowUpForLead(lead);
        }}
        onEditLead={(lead) => {
          setSelectedLeadIdForDossier(null);
          if (onEditLead) onEditLead(lead);
        }}
      />

      {/* Quick Reschedule Modal opened from Action Center */}
      <RescheduleModal
        isOpen={Boolean(rescheduleItem)}
        onClose={() => setRescheduleItem(null)}
        followUp={rescheduleItem}
        onRescheduled={() => {
          setRescheduleItem(null);
          fetchDashboardData();
        }}
      />
    </div>
  );
};
