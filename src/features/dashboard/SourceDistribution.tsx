import React from 'react';
import { Compass, Filter } from 'lucide-react';

export interface SourceDistributionProps {
  sourceDistribution: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
  totalLeads: number;
  isLoading?: boolean;
  onSelectSource?: (source: string) => void;
}

export const SourceDistribution: React.FC<SourceDistributionProps> = ({
  sourceDistribution,
  totalLeads,
  isLoading = false,
  onSelectSource,
}) => {
  return (
    <div className="bento-card-surface bento-glow-top-purple fade-in-slide" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={16} color="#7c3aed" />
          </div>
          <span>Leads by Enquiry Source</span>
        </h3>
        {onSelectSource && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            <Filter size={11} /> Click channel to filter
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Marketing, referral, and direct walk-in acquisition channels
      </p>

      {isLoading ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading acquisition channels...
        </div>
      ) : totalLeads === 0 ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No enquiry channels active yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'center' }}>
          {sourceDistribution.map((item) => {
            const isClickable = Boolean(onSelectSource);
            return (
              <div
                key={item.label}
                onClick={() => onSelectSource && onSelectSource(item.label)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onSelectSource && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectSource(item.label);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'background 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }
                }}
                title={isClickable ? `Click to filter leads by source: ${item.label}` : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: item.count > 0 ? '#4f46e5' : '#94a3b8',
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.count}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: item.count > 0 ? '#4338ca' : 'var(--text-muted)',
                      background: item.count > 0 ? '#e0e7ff' : '#f1f5f9',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

