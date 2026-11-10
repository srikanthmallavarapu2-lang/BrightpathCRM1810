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
          sparklineColor: '#ef4444',
          sparklineFill: 'rgba(239, 68, 68, 0.08)',
        };
      case 'success':
        return {
          cardBg: 'white',
          cardBorder: 'var(--border-subtle)',
          valueColor: '#047857',
          iconBg: '#ecfdf5',
          iconColor: '#059669',
          titleColor: 'var(--text-muted)',
          sparklineColor: '#10b981',
          sparklineFill: 'rgba(16, 185, 129, 0.08)',
        };
      case 'purple':
        return {
          cardBg: 'white',
          cardBorder: 'var(--border-subtle)',
          valueColor: 'var(--text-main)',
          iconBg: '#f5f3ff',
          iconColor: '#7c3aed',
          titleColor: 'var(--text-muted)',
          sparklineColor: '#8b5cf6',
          sparklineFill: 'rgba(139, 92, 246, 0.08)',
        };
      case 'blue':
        return {
          cardBg: 'white',
          cardBorder: 'var(--border-subtle)',
          valueColor: 'var(--text-main)',
          iconBg: '#eff6ff',
          iconColor: '#2563eb',
          titleColor: 'var(--text-muted)',
          sparklineColor: '#3b82f6',
          sparklineFill: 'rgba(59, 130, 246, 0.08)',
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
          sparklineColor: '#64748b',
          sparklineFill: 'rgba(100, 116, 139, 0.08)',
        };
    }
  };

  const styles = getVariantStyles();
  const isClickable = Boolean(onClick);

  const getGlowClass = () => {
    switch (variant) {
      case 'alert':
        return 'bento-glow-top-alert';
      case 'success':
        return 'bento-glow-top-emerald';
      case 'purple':
        return 'bento-glow-top-purple';
      case 'blue':
        return 'bento-glow-top-blue';
      default:
        return 'bento-glow-top-blue';
    }
  };

  return (
    <div
      className={`bento-card-surface ${getGlowClass()} btn-micro-spring fade-in-slide`}
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
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.65rem' }}>
          {trendBadge ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className={`metric-velocity-pill ${trendBadge.positive !== false ? 'positive' : 'neutral'}`}>
                <ArrowUpRight size={12} />
                <span>{trendBadge.text}</span>
              </span>
            </div>
          ) : subtitle ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          ) : (
            <div />
          )}

          {/* 21st.dev Mini Sparkline Curve */}
          <svg width="56" height="20" viewBox="0 0 56 20" fill="none" className="sparkline-svg">
            <path
              d={variant === 'alert' ? "M 0 6 Q 14 16, 28 8 T 56 16" : "M 0 16 Q 14 18, 28 8 T 56 4"}
              stroke={styles.sparklineColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d={`${variant === 'alert' ? "M 0 6 Q 14 16, 28 8 T 56 16" : "M 0 16 Q 14 18, 28 8 T 56 4"} L 56 20 L 0 20 Z`}
              fill={styles.sparklineFill}
            />
          </svg>
        </div>
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

