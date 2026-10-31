import React from 'react';
import { LeadStatus } from '../../types/database';
import { Filter, Layers } from 'lucide-react';

export interface StatusDistributionProps {
  statusDistribution: Array<{
    label: LeadStatus;
    count: number;
    percentage: number;
    color: string;
  }>;
  totalLeads: number;
  isLoading?: boolean;
  onSelectStatus?: (status: LeadStatus) => void;
}

export const StatusDistribution: React.FC<StatusDistributionProps> = ({
  statusDistribution,
  totalLeads,
  isLoading = false,
  onSelectStatus,
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={18} color="#2563eb" />
          <span>Pipeline by Status</span>
        </h3>
        {onSelectStatus && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Filter size={11} /> Click stage to filter
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Live enquiry distribution across admission lifecycle stages
      </p>

      {isLoading ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading pipeline distribution...
        </div>
      ) : totalLeads === 0 ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No enquiries recorded yet. Once student enquiries are added, the admission funnel will appear here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', flex: 1, justifyContent: 'center' }}>
          {statusDistribution.map((item) => {
            const isClickable = Boolean(onSelectStatus);
            return (
              <div
                key={item.label}
                onClick={() => onSelectStatus && onSelectStatus(item.label)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onSelectStatus && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectStatus(item.label);
                  }
                }}
                style={{
                  cursor: isClickable ? 'pointer' : 'default',
                  padding: isClickable ? '0.4rem 0.6rem' : '0.2rem 0',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (isClickable) e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (isClickable) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={isClickable ? `Click to filter leads by status: ${item.label}` : undefined}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: item.color,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <strong>{item.count}</strong> {item.count === 1 ? 'lead' : 'leads'} ({item.percentage}%)
                  </span>
                </div>

                <div
                  style={{
                    height: 8,
                    background: '#e2e8f0',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

