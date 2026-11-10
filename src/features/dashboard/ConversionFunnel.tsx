import React from 'react';
import { 
  Filter, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles, 
  PhoneCall, 
  UserCheck 
} from 'lucide-react';
import { LeadStatus } from '../../types/database';

interface ConversionFunnelProps {
  totalLeads: number;
  contactedCount: number;
  qualifiedCount: number;
  convertedCount: number;
  onSelectStage?: (status: LeadStatus) => void;
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({
  totalLeads,
  contactedCount,
  qualifiedCount,
  convertedCount,
  onSelectStage,
}) => {
  // Compute conversion percentages against total leads
  const safeTotal = Math.max(1, totalLeads);
  const contactedPct = totalLeads > 0 ? Math.round((contactedCount / safeTotal) * 100) : 0;
  const qualifiedPct = totalLeads > 0 ? Math.round((qualifiedCount / safeTotal) * 100) : 0;
  const convertedPct = totalLeads > 0 ? Math.round((convertedCount / safeTotal) * 100) : 0;

  // Drop-off calculations between consecutive stages
  const dropContactedToQualified = contactedCount > 0 
    ? Math.max(0, Math.round(((contactedCount - qualifiedCount) / contactedCount) * 100))
    : 0;

  const dropQualifiedToConverted = qualifiedCount > 0
    ? Math.max(0, Math.round(((qualifiedCount - convertedCount) / qualifiedCount) * 100))
    : 0;

  const stages = [
    {
      status: 'New' as LeadStatus,
      label: 'Total Inflow',
      sublabel: 'New Student Enquiries',
      count: totalLeads,
      pct: 100,
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      icon: Sparkles,
    },
    {
      status: 'Contacted' as LeadStatus,
      label: 'Counsellor Contacted',
      sublabel: 'Phone/WhatsApp outreach',
      count: contactedCount,
      pct: contactedPct,
      color: '#6d28d9',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      icon: PhoneCall,
      dropOff: totalLeads > 0 && totalLeads > contactedCount 
        ? Math.round(((totalLeads - contactedCount) / safeTotal) * 100) 
        : null,
    },
    {
      status: 'Qualified' as LeadStatus,
      label: 'Admission Qualified',
      sublabel: 'Eligible & Fee Evaluated',
      count: qualifiedCount,
      pct: qualifiedPct,
      color: '#b45309',
      bg: '#fffbeb',
      border: '#fde68a',
      icon: Filter,
      dropOff: dropContactedToQualified,
    },
    {
      status: 'Converted' as LeadStatus,
      label: 'Enrolled & Paid',
      sublabel: 'Confirmed Student Admission',
      count: convertedCount,
      pct: convertedPct,
      color: '#047857',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      icon: UserCheck,
      dropOff: dropQualifiedToConverted,
    },
  ];

  return (
    <div className="bento-card-surface bento-glow-top-blue fade-in-slide" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Filter size={16} color="#2563eb" />
          </div>
          <span>Admissions Conversion Funnel &amp; Drop-off Analysis</span>
        </h3>
        <span style={{ fontSize: '0.785rem', color: '#047857', background: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 800, border: '1px solid #a7f3d0' }}>
          Overall Pipeline Yield: {convertedPct}%
        </span>
      </div>

      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Visualizing prospective student progression across milestones and identifying stage-by-stage counselling drop-offs
      </p>

      {/* Funnel Stages Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1rem',
          position: 'relative',
        }}
      >
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isFinal = idx === stages.length - 1;

          return (
            <div
              key={stage.status}
              onClick={() => onSelectStage && onSelectStage(stage.status)}
              className="btn-micro-spring"
              style={{
                background: stage.bg,
                border: `1px solid ${stage.border}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: onSelectStage ? 'pointer' : 'default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                position: 'relative',
              }}
              title={onSelectStage ? `Filter leads with status "${stage.status}"` : undefined}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div 
                      style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 'var(--radius-md)', 
                        background: '#ffffff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: stage.color,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Stage {idx + 1}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: stage.color, fontFamily: 'var(--font-mono)' }}>
                    {stage.pct}%
                  </span>
                </div>

                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.25rem 0', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                  {stage.count} <span style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--text-muted)' }}>students</span>
                </div>

                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {stage.sublabel}
                </div>
              </div>

              {/* Progress bar inside stage */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ height: 7, background: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${stage.pct}%`, 
                      height: '100%', 
                      background: stage.color, 
                      borderRadius: 4,
                      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }} 
                  />
                </div>

                {stage.dropOff !== null && stage.dropOff !== undefined && (
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      fontSize: '0.72rem', 
                      color: stage.dropOff > 30 ? '#dc2626' : '#d97706',
                      marginTop: '0.45rem',
                      fontWeight: 700,
                    }}
                  >
                    <TrendingDown size={12} />
                    <span>{stage.dropOff}% drop-off from previous</span>
                  </div>
                )}

                {isFinal && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#059669', marginTop: '0.45rem', fontWeight: 800 }}>
                    <CheckCircle2 size={12} />
                    <span>Full Tuition Realized</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
