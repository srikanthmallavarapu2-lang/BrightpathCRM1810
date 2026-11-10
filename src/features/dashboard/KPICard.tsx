import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  trendBadge?: {
    text: string;
    positive?: boolean;
  };
  subtitle?: string;
  variant?: 'default' | 'alert' | 'success' | 'purple' | 'blue';
  onClick?: () => void;
  drilldownLabel?: string;
  isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  trendBadge,
  subtitle,
  variant = 'default',
  onClick,
  drilldownLabel,
  isLoading = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'alert':
        return {
          cardBg: '#fff8f8',
          cardBorder: 'rgba(239, 68, 68, 0.35)',
          valueColor: '#dc2626',
          iconBg: '#fef2f2',
          iconColor: '#dc2626',
          titleColor: '#b91c1c',
        };
      case 'success':
        return {
          cardBg: 'white',
          cardBorder: 'var(--border-subtle)',
          valueColor: '#047857',
          iconBg: '#ecfdf5',
          iconColor: '#059669',
          titleColor: 'var(--text-muted)',
        };
      case 'purple':
        return {
          cardBg: 'white',
          cardBorder: 'var(--border-subtle)',
          valueColor: 'var(--text-main)',
          iconBg: '#f5f3ff',
          iconColor: '#7c3aed',
          titleColor: 'var(--text-muted)',
        };
      case 'blue':
        return {
          cardBg: 'white',
          cardBorder: 'var(--border-subtle)',
          valueColor: 'var(--text-main)',
          iconBg: '#eff6ff',
          iconColor: '#2563eb',
          titleColor: 'var(--text-muted)',
        };
      case 'default':
      default:
        return {
          cardBg: 'white',
          cardBorder: 'var(--border-subtle)',
          valueColor: 'var(--text-main)',
          iconBg: '#f1f5f9',
          iconColor: '#64748b',
          titleColor: 'var(--text-muted)',
        };
    }
  };

  const styles = getVariantStyles();
  const isClickable = Boolean(onClick);

  return (
    <div
      className="card fade-in-slide"
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        background: styles.cardBg,
        borderColor: styles.cardBorder,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        }
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: styles.titleColor,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </p>
            <h3
              style={{
                fontSize: '2.1rem',
                fontWeight: 900,
                color: styles.valueColor,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                marginTop: '0.35rem',
                lineHeight: 1.1,
              }}
            >
              {isLoading ? '...' : value}
            </h3>
          </div>
          <div
            style={{
              padding: '0.55rem',
              borderRadius: 'var(--radius-md)',
              background: styles.iconBg,
              color: styles.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        </div>

        {trendBadge && (
          <p
            style={{
              fontSize: '0.75rem',
              color: trendBadge.positive !== false ? '#16a34a' : '#dc2626',
              marginTop: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            <ArrowUpRight size={13} />
            <span>{trendBadge.text}</span>
          </p>
        )}

        {subtitle && !trendBadge && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.65rem',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {drilldownLabel && (
        <div
          style={{
            marginTop: '0.85rem',
            paddingTop: '0.5rem',
            borderTop: '1px dashed var(--border-subtle)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: variant === 'alert' ? '#dc2626' : 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{drilldownLabel}</span>
          <span>&rarr;</span>
        </div>
      )}
    </div>
  );
};

