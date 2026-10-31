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
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#2563eb" />
          <span>Admissions Conversion Funnel &amp; Drop-off Analysis</span>
        </h3>
        <span style={{ fontSize: '0.785rem', color: '#047857', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid #a7f3d0' }}>
          Overall Pipeline Yield: {convertedPct}%
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Visualizing student progression across pipeline milestones and identifying admission drop-off points
      </p>

      {/* Funnel Stages Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
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
              style={{
                background: stage.bg,
                border: `1px solid ${stage.border}`,
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: onSelectStage ? 'pointer' : 'default',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (onSelectStage) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (onSelectStage) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              title={onSelectStage ? `Filter leads with status "${stage.status}"` : undefined}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div 
                      style={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: 'var(--radius-sm)', 
                        background: '#ffffff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: stage.color,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Stage {idx + 1}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: stage.color }}>
                    {stage.pct}%
                  </span>
                </div>

                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0' }}>
                  {stage.count} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>students</span>
                </div>

                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {stage.sublabel}
                </div>
              </div>

              {/* Progress bar inside stage */}
              <div style={{ marginTop: '0.85rem' }}>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${stage.pct}%`, 
                      height: '100%', 
                      background: stage.color, 
                      borderRadius: 3,
                      transition: 'width 0.5s ease' 
                    }} 
                  />
                </div>

                {stage.dropOff !== null && stage.dropOff !== undefined && (
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      fontSize: '0.7rem', 
                      color: stage.dropOff > 30 ? '#dc2626' : '#d97706',
                      marginTop: '0.4rem',
                      fontWeight: 600,
                    }}
                  >
                    <TrendingDown size={11} />
                    <span>{stage.dropOff}% drop-off from previous</span>
                  </div>
                )}

                {isFinal && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#059669', marginTop: '0.4rem', fontWeight: 700 }}>
                    <CheckCircle2 size={11} />
                    <span>Full Tuition Unlocked</span>
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
