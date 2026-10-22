import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  ClockAlert, 
  TrendingUp, 
  ArrowUpRight,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { dashboardService, DashboardMetrics } from '../../services/dashboardService';

interface DashboardViewProps {
  onNavigateToLeads: () => void;
  onNavigateToFollowUps: () => void;
  onOpenAssistant?: () => void;
  onOpenCreateLead?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToLeads,
  onNavigateToFollowUps,
  onOpenAssistant,
  onOpenCreateLead,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    const { metrics: data } = await dashboardService.getMetrics();
    setMetrics(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

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
              width: 40, 
              height: 40, 
              borderRadius: 'var(--radius-md)', 
              background: '#2563eb', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Live Admissions Pipeline &amp; KPI Engine</span>
              <span className="radar-dot connected" />
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reconciled 100% in real-time with your live Supabase database records.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchMetrics} 
            className="btn btn-outline" 
            title="Recalculate metrics from database"
            style={{ fontSize: '0.8rem', gap: '5px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>Sync KPIs</span>
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
          <button onClick={onNavigateToLeads} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            <span>View Leads</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* KPI 1: Total Leads */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Leads
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {isLoading ? '...' : (metrics?.totalLeads ?? 0)}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: '#eff6ff', color: '#2563eb' }}>
              <Users size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> +{metrics?.addedToday ?? 0} added today
          </p>
        </div>

        {/* KPI 2: New Enquiries */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                New Enquiries
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {isLoading ? '...' : (metrics?.newEnquiries ?? 0)}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: '#eff6ff', color: '#3b82f6' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Needs initial phone call
          </p>
        </div>

        {/* KPI 3: Converted */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Converted
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem' }}>
                {isLoading ? '...' : (metrics?.convertedLeads ?? 0)}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: '#ecfdf5', color: '#059669' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Enrolled students
          </p>
        </div>

        {/* KPI 4: Overdue Follow-ups */}
        <div 
          className="card" 
          style={{ 
            borderColor: (metrics?.overdueFollowUps ?? 0) > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)',
            background: (metrics?.overdueFollowUps ?? 0) > 0 ? '#fff8f8' : 'white'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: (metrics?.overdueFollowUps ?? 0) > 0 ? '#b91c1c' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                Overdue Follow-ups
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: (metrics?.overdueFollowUps ?? 0) > 0 ? '#dc2626' : 'var(--text-main)', marginTop: '0.25rem' }}>
                {isLoading ? '...' : (metrics?.overdueFollowUps ?? 0)}
              </h3>
            </div>
            <div 
              style={{ 
                padding: '0.5rem', 
                borderRadius: 'var(--radius-md)', 
                background: (metrics?.overdueFollowUps ?? 0) > 0 ? '#fef2f2' : '#f1f5f9', 
                color: (metrics?.overdueFollowUps ?? 0) > 0 ? '#dc2626' : '#64748b' 
              }}
            >
              <ClockAlert size={20} />
            </div>
          </div>
          <button 
            onClick={onNavigateToFollowUps}
            style={{ 
              fontSize: '0.75rem', 
              color: (metrics?.overdueFollowUps ?? 0) > 0 ? '#dc2626' : 'var(--primary-600)', 
              marginTop: '0.75rem', 
              fontWeight: 600, 
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0
            }}
          >
            Review follow-up schedule &rarr;
          </button>
        </div>

        {/* KPI 5: Conversion Rate */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Conversion Rate
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {isLoading ? '...' : `${metrics?.conversionRate ?? 0}%`}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: '#f5f3ff', color: '#7c3aed' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            (Converted / Total) &times; 100
          </p>
        </div>
      </div>

      {/* Two Column Layout: Pipeline Status & Source Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Pipeline Distribution Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Pipeline by Status
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Live lead distribution across admission stages
          </p>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading pipeline data...
            </div>
          ) : (metrics?.totalLeads ?? 0) === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No enquiries recorded yet. Once student enquiries are added, the admission funnel will appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {metrics?.statusDistribution.map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {item.count} {item.count === 1 ? 'lead' : 'leads'} ({item.percentage}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${item.percentage}%`, 
                        height: '100%', 
                        background: item.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.6s ease'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Source Distribution Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Leads by Enquiry Source
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Marketing, referral, and walk-in channels
          </p>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading source breakdown...
            </div>
          ) : (metrics?.totalLeads ?? 0) === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No enquiry channels active yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {metrics?.sourceDistribution.map((item) => (
                <div 
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
                    {item.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.count}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
