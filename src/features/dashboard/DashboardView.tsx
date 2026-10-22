import React from 'react';
import { 
  Users, 
  UserCheck, 
  ClockAlert, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToLeads: () => void;
  onNavigateToFollowUps: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToLeads,
  onNavigateToFollowUps,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Workshop Phase Progress Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(59, 130, 246, 0.03))',
          border: '1px solid rgba(37, 99, 235, 0.2)',
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
              background: 'var(--primary-500)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Phase 1 Deployed: Design System & Navigation Shell
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Next step: Phase 2 connects Supabase client & environment resilience. Fictional preview active.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onNavigateToLeads} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            <span>View Leads</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* KPI 1 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Leads
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                24
              </h3>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: '#eff6ff', color: '#2563eb' }}>
              <Users size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> +4 added today
          </p>
        </div>

        {/* KPI 2 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                New Enquiries
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                8
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

        {/* KPI 3 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Converted
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem' }}>
                5
              </h3>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: '#ecfdf5', color: '#059669' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Enrolled in courses
          </p>
        </div>

        {/* KPI 4 */}
        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b91c1c', textTransform: 'uppercase' }}>
                Overdue Follow-ups
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }}>
                2
              </h3>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: '#dc2626' }}>
              <ClockAlert size={20} />
            </div>
          </div>
          <button 
            onClick={onNavigateToFollowUps}
            style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.75rem', fontWeight: 600, textDecoration: 'underline' }}
          >
            Review overdue tasks &rarr;
          </button>
        </div>

        {/* KPI 5 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Conversion Rate
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                20.8%
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
            Active lead distribution across admission stages
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { label: 'New', count: 8, percentage: 33, color: '#3b82f6' },
              { label: 'Contacted', count: 6, percentage: 25, color: '#8b5cf6' },
              { label: 'Qualified', count: 4, percentage: 17, color: '#f59e0b' },
              { label: 'Converted', count: 5, percentage: 21, color: '#10b981' },
              { label: 'Lost', count: 1, percentage: 4, color: '#ef4444' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.count} leads ({item.percentage}%)</span>
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
        </div>

        {/* Source Distribution Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Leads by Enquiry Source
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Top marketing and referral channels
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { source: 'Website Form', count: 11, pct: '46%' },
              { source: 'Walk-in Visit', count: 6, pct: '25%' },
              { source: 'Inbound Phone Call', count: 4, pct: '17%' },
              { source: 'Student Referral', count: 3, pct: '12%' },
            ].map((s) => (
              <div 
                key={s.source}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.source}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                  {s.count} ({s.pct})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
