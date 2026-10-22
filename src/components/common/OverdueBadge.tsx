import React from 'react';
import { AlertCircle } from 'lucide-react';

interface OverdueBadgeProps {
  dueAt: string;
  showRelativeTime?: boolean;
}

export const OverdueBadge: React.FC<OverdueBadgeProps> = ({ 
  dueAt, 
  showRelativeTime = true 
}) => {
  const getRelativeOverdueText = (dueDateStr: string): string => {
    try {
      const due = new Date(dueDateStr).getTime();
      const now = Date.now();
      const diffMs = now - due;

      if (diffMs <= 0) return 'Due soon';

      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `Overdue by ${diffDays}d ${diffHours % 24}h`;
      }
      if (diffHours > 0) {
        return `Overdue by ${diffHours}h ${diffMinutes % 60}m`;
      }
      return `Overdue by ${diffMinutes}m`;
    } catch {
      return 'Overdue';
    }
  };

  const relativeText = showRelativeTime ? getRelativeOverdueText(dueAt) : 'Overdue';

  return (
    <span
      className="status-badge lost"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fee2e2',
        fontWeight: 600,
        fontSize: '0.75rem',
        padding: '0.2rem 0.55rem',
        borderRadius: 'var(--radius-full)',
      }}
      title={`Task was due at ${new Date(dueAt).toLocaleString()}`}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          display: 'inline-block',
          boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
        }}
      />
      <AlertCircle size={12} color="#dc2626" />
      <span>{relativeText}</span>
    </span>
  );
};
