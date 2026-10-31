import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  ClockAlert, 
  TrendingUp, 
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
import { leadService } from '../../services/leadService';
import { FollowUp, Lead, LeadStatus } from '../../types/database';
import { KPICard } from './KPICard';
import { StatusDistribution } from './StatusDistribution';
import { SourceDistribution } from './SourceDistribution';
import { ActionCenter } from './ActionCenter';
import { CounsellorLeaderboard } from './CounsellorLeaderboard';
import { ConversionFunnel } from './ConversionFunnel';
import { RevenueMetricsCard } from './RevenueMetricsCard';
import { AcademyLogo } from '../../components/common/AcademyLogo';
import { PublicEnquiryModal } from '../simulator/PublicEnquiryModal';
import { LeadDetailModal } from '../leads/LeadDetailModal';
import { RescheduleModal } from '../followups/RescheduleModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [topOverdue, setTopOverdue] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // In-dashboard modal states
  const [selectedLeadIdForDossier, setSelectedLeadIdForDossier] = useState<string | null>(null);
  const [rescheduleItem, setRescheduleItem] = useState<FollowUp | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const toast = useToast();
  const { role, isAdmin, isManager, isCounsellor } = useAuth();
  const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Counsellor';

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [metricsRes, overdueRes, leadsRes] = await Promise.all([
      dashboardService.getMetrics(),
      dashboardService.getTopOverdueFollowUps(5),
      leadService.getLeads(),
    ]);

    if (metricsRes.error) {
      setErrorMessage(metricsRes.error);
    } else {
      setMetrics(metricsRes.metrics);
    }

    setLeads(leadsRes.leads || []);
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
          <AcademyLogo size={42} />
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>BrightPath Academy &bull; Admissions Pipeline &amp; KPI Engine</span>
              <span className="radar-dot connected" title="Supabase Database Live Connected" />
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Intake Session 2026–2027 &bull; Reconciled 100% in real-time with your permitted Supabase PostgreSQL records.
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

      {/* Role-Specific Operational Directive Banner */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: isAdmin ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' : isManager ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: `1px solid ${isAdmin ? '#d8b4fe' : isManager ? '#bfdbfe' : '#bbf7d0'}`,
          fontSize: '0.825rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin ? (
            <span style={{ fontSize: '1.1rem' }}>👑</span>
          ) : isManager ? (
            <span style={{ fontSize: '1.1rem' }}>🛡️</span>
          ) : (
            <span style={{ fontSize: '1.1rem' }}>🎓</span>
          )}
          <div>
            <strong style={{ color: isAdmin ? '#6b21a8' : isManager ? '#1e40af' : '#15803d' }}>
              Active Workspace: {formattedRole} Mode
            </strong>
            <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
              {isAdmin 
                ? 'Full administrative privileges active. All 5 technical tracks, revenue telemetry, permanent lead purging, and staff role provisioning unlocked.'
                : isManager 
                ? 'Branch supervisory mode active. Pipeline auditing, counsellor leaderboard analysis, and lead deletion enabled.'
                : 'Admissions counseling mode active. Focus on converting student enquiries, 1-Click WhatsApp follow-ups, and issuing official admission slips.'}
            </span>
          </div>
        </div>

        {isCounsellor && (
          <button
            onClick={() => onNavigateToLeads()}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderColor: '#86efac', color: '#166534', background: '#ffffff', gap: '4px' }}
          >
            <span>My Assigned Leads</span>
            <ArrowRight size={12} />
          </button>
        )}
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

      {/* Financial Tuition Revenue & Pipeline Value Counter */}
      <RevenueMetricsCard leads={leads} />

      {/* Visual Admissions Conversion Funnel & Drop-off Analysis */}
      <ConversionFunnel
        totalLeads={metrics?.totalLeads ?? leads.length}
        contactedCount={leads.filter((l) => l.status === 'Contacted' || l.status === 'Qualified' || l.status === 'Converted').length}
        qualifiedCount={leads.filter((l) => l.status === 'Qualified' || l.status === 'Converted').length}
        convertedCount={metrics?.convertedLeads ?? leads.filter((l) => l.status === 'Converted').length}
        onSelectStage={onNavigateToLeadsWithStatus}
      />

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
        initialLead={leads.find((l) => l.id === selectedLeadIdForDossier) || null}
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
