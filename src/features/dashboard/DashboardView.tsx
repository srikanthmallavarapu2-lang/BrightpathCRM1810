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
  const [isIngestingDemo, setIsIngestingDemo] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const toast = useToast();
  const { role, isAdmin, isManager, isCounsellor, signIn } = useAuth();
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

  const handleQuickDemoStudent = async () => {
    setIsIngestingDemo(true);
    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const demoStudents = [
        { name: 'Rohan Verma', course: 'Cloud & DevOps' },
        { name: 'Kavya Nair', course: 'Data Science & AI' },
        { name: 'Aditya Sen', course: 'Full Stack Web Dev' },
        { name: 'Tanvi Mehta', course: 'UI/UX Design' },
        { name: 'Sameer Joshi', course: 'Cybersecurity' },
      ];
      const pick = demoStudents[Math.floor(Math.random() * demoStudents.length)];
      const phone = `98765${randomSuffix}`;
      const email = `${pick.name.toLowerCase().replace(/\s+/g, '.')}${randomSuffix}@gmail.com`;

      const result = await leadService.createLead({
        full_name: pick.name,
        phone,
        email,
        course_interest: pick.course,
        source: 'Website Form',
        status: 'New',
        notes: '⚡ Live 1-click test student enquiry ingested for client demonstration',
      });

      if (result.lead) {
        toast.success(`Demo student "${pick.name}" (${pick.course}) ingested live!`);
        await fetchDashboardData();
      } else {
        toast.error(result.error || 'Failed to ingest demo student');
      }
    } catch {
      toast.error('Could not complete demo student ingestion');
    } finally {
      setIsIngestingDemo(false);
    }
  };

  const handleQuickRoleSwitch = async (targetRole: 'admin' | 'manager' | 'counsellor') => {
    if (role === targetRole || isSwitchingRole) return;
    setIsSwitchingRole(true);
    const creds = {
      admin: { email: 'admin@brightpath-academy.com', pass: 'Admin@123456', name: 'Dr. S. K. Jenkins' },
      manager: { email: 'manager@brightpath-academy.com', pass: 'Manager@123456', name: 'Marcus Vance' },
      counsellor: { email: 'counsellor@brightpath-academy.com', pass: 'Counsellor@123456', name: 'Sarah Jenkins' },
    }[targetRole];

    try {
      const res = await signIn(creds.email, creds.pass);
      if (res.success) {
        toast.success(`Switched role to ${targetRole.toUpperCase()} (${creds.name})`);
        await fetchDashboardData();
      } else {
        toast.error(res.error || 'Failed to switch role');
      }
    } catch {
      toast.error('Role transition failed');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  // Admissions Target & Cohort Telemetry
  const cohortTarget = 10;
  const currentConverted = metrics?.convertedLeads ?? leads.filter((l) => l.status === 'Converted').length;
  const cohortProgressPct = Math.min(100, Math.round((currentConverted / cohortTarget) * 100));
  const seatsRemaining = Math.max(0, cohortTarget - currentConverted);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Real-time Live Operations Bento Header Banner */}
      <div 
        className="bento-card-surface bento-glow-top-blue fade-in-slide"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.6))',
          padding: '1.5rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AcademyLogo size={46} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>BrightPath Academy &bull; Admissions Command Engine</span>
              </h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '0.72rem', fontWeight: 800, color: '#047857' }}>
                <span className="radar-dot connected" style={{ width: 8, height: 8 }} />
                <span>Supabase PostgreSQL 100% Synced</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Intake Session 2026–2027 &bull; Real-time conversion velocity, admissions target tracking, and role-governed enquiry telemetry.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Quick 1-Click Demo Student Ingestion Button */}
          <button 
            onClick={handleQuickDemoStudent}
            disabled={isIngestingDemo}
            className="btn btn-micro-spring"
            style={{ 
              fontSize: '0.8rem', 
              gap: '6px', 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              fontWeight: 700,
            }}
            title="Ingest a realistic test student enquiry in 1-click for sales demonstrations"
          >
            <Sparkles size={14} className={isIngestingDemo ? 'spin' : ''} />
            <span>{isIngestingDemo ? 'Ingesting...' : '⚡ Demo Student (1-Click)'}</span>
          </button>

          <button 
            onClick={fetchDashboardData} 
            className="btn btn-outline btn-micro-spring" 
            title="Recalculate metrics from database"
            style={{ fontSize: '0.8rem', gap: '5px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>Sync KPIs</span>
          </button>

          <button 
            onClick={() => setIsSimulatorOpen(true)}
            className="btn btn-outline btn-micro-spring"
            style={{ fontSize: '0.8rem', gap: '5px', borderColor: '#c4b5fd', color: '#6d28d9', background: '#faf5ff' }}
            title="Simulate live student website enquiry submission"
          >
            <Globe size={13} color="#7c3aed" />
            <span>Web Simulator</span>
          </button>

          {onOpenAssistant && (
            <button 
              onClick={onOpenAssistant} 
              className="btn btn-outline btn-micro-spring" 
              style={{ fontSize: '0.8rem', gap: '5px' }}
              title="Open Supabase Integration Assistant"
            >
              <Database size={13} color="#059669" />
              <span>Assistant</span>
            </button>
          )}

          {onOpenCreateLead && (
            <button onClick={onOpenCreateLead} className="btn btn-primary btn-micro-spring" style={{ fontSize: '0.8rem', gap: '5px' }}>
              <Plus size={14} />
              <span>Record Enquiry</span>
            </button>
          )}

          <button onClick={onNavigateToLeads} className="btn btn-secondary btn-micro-spring" style={{ fontSize: '0.8rem', gap: '5px' }}>
            <span>View Leads</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Admissions Target & Cohort Velocity Command Bar */}
      <div 
        className="bento-card-surface fade-in-slide"
        style={{
          padding: '1.15rem 1.5rem',
          background: '#ffffff',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem' }}>🎯</span>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                Cohort 04 Admissions Target: {currentConverted} / {cohortTarget} Seats Confirmed
              </span>
              <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                ({cohortProgressPct}% Goal Achieved)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#047857', fontWeight: 700, background: '#ecfdf5', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid #a7f3d0' }}>
              <span>Batch Intake:</span> <strong>16 Nov 2026</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: seatsRemaining <= 5 ? '#dc2626' : '#2563eb', fontWeight: 700, background: seatsRemaining <= 5 ? '#fef2f2' : '#eff6ff', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: `1px solid ${seatsRemaining <= 5 ? '#fecaca' : '#bfdbfe'}` }}>
              <span>Seats Available:</span> <strong>{seatsRemaining} Seats Left</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#7c3aed', fontWeight: 700, background: '#f5f3ff', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid #ddd6fe' }}>
              <span>Conversion Yield:</span> <strong>{metrics?.conversionRate ?? 50}%</strong>
            </span>
          </div>
        </div>

        {/* Progress bar track */}
        <div className="target-track-container">
          <div className="target-track-fill" style={{ width: `${cohortProgressPct}%` }} />
        </div>
      </div>

      {/* Role-Specific Operational Directive Banner with 1-Click Role Switcher */}
      <div 
        className="bento-card-surface fade-in-slide"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.5rem',
          background: isAdmin ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' : isManager ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: `1px solid ${isAdmin ? '#d8b4fe' : isManager ? '#bfdbfe' : '#bbf7d0'}`,
          fontSize: '0.825rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.35rem' }}>{isAdmin ? '👑' : isManager ? '🛡️' : '🎓'}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <strong style={{ color: isAdmin ? '#6b21a8' : isManager ? '#1e40af' : '#15803d', fontSize: '0.925rem', fontFamily: 'var(--font-display)' }}>
                Active Session: {formattedRole} Mode
              </strong>
              <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: '#ffffff', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>
                1-Click Demo Persona Toggle &darr;
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isAdmin 
                ? 'Full administrative privileges active. All 5 technical tracks, revenue telemetry, permanent lead purging, and staff role provisioning unlocked.'
                : isManager 
                ? 'Branch supervisory mode active. Pipeline auditing, counsellor leaderboard analysis, and lead deletion enabled.'
                : 'Admissions counseling mode active. Focus on converting student enquiries, 1-Click WhatsApp follow-ups, and issuing official admission slips.'}
            </p>
          </div>
        </div>

        {/* 1-Click Role Switcher Quick Pills for Client Demos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Switch Role:
          </span>

          <button
            type="button"
            disabled={isSwitchingRole || isAdmin}
            onClick={() => handleQuickRoleSwitch('admin')}
            className={`role-pill-btn btn-micro-spring ${isAdmin ? 'active' : ''}`}
            style={{
              background: isAdmin ? '#7c3aed' : '#ffffff',
              color: isAdmin ? '#ffffff' : '#6d28d9',
              borderColor: '#c4b5fd',
              boxShadow: isAdmin ? '0 2px 8px rgba(124, 58, 237, 0.3)' : 'none',
            }}
            title="1-Click Switch to Administrator (Dr. S. K. Jenkins)"
          >
            <span>👑 Admin</span>
          </button>

          <button
            type="button"
            disabled={isSwitchingRole || isManager}
            onClick={() => handleQuickRoleSwitch('manager')}
            className={`role-pill-btn btn-micro-spring ${isManager ? 'active' : ''}`}
            style={{
              background: isManager ? '#2563eb' : '#ffffff',
              color: isManager ? '#ffffff' : '#1d4ed8',
              borderColor: '#93c5fd',
              boxShadow: isManager ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
            }}
            title="1-Click Switch to Branch Manager (Marcus Vance)"
          >
            <span>🛡️ Manager</span>
          </button>

          <button
            type="button"
            disabled={isSwitchingRole || isCounsellor}
            onClick={() => handleQuickRoleSwitch('counsellor')}
            className={`role-pill-btn btn-micro-spring ${isCounsellor ? 'active' : ''}`}
            style={{
              background: isCounsellor ? '#16a34a' : '#ffffff',
              color: isCounsellor ? '#ffffff' : '#15803d',
              borderColor: '#86efac',
              boxShadow: isCounsellor ? '0 2px 8px rgba(22, 163, 74, 0.3)' : 'none',
            }}
            title="1-Click Switch to Academic Counsellor (Sarah Jenkins)"
          >
            <span>🎓 Counsellor</span>
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
