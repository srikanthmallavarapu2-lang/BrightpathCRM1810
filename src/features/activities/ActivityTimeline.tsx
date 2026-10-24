import React from 'react';
import { 
  Sparkles, 
  ArrowRightLeft, 
  CalendarClock, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  User, 
  AlertTriangle 
} from 'lucide-react';
import { Activity, ActivityType } from '../../types/database';

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  isLoading = false,
}) => {
  const getRelativeTime = (dateString: string): string => {
    try {
      const now = Date.now();
      const past = new Date(dateString).getTime();
      const diffMs = now - past;

      if (diffMs < 60000) return 'just now';

      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 60) return `${diffMinutes}m ago`;

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) {
        return `Yesterday at ${new Date(dateString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (diffDays < 7) return `${diffDays}d ago`;

      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getEventConfig = (type: ActivityType | string) => {
    switch (type) {
      case 'lead_created':
        return {
          title: 'Student Enquiry Created',
          icon: Sparkles,
          bg: '#eff6ff',
          color: '#2563eb',
          borderColor: '#bfdbfe',
        };
      case 'status_changed':
        return {
          title: 'Pipeline Status Updated',
          icon: ArrowRightLeft,
          bg: '#f5f3ff',
          color: '#7c3aed',
          borderColor: '#ddd6fe',
        };
      case 'follow_up_scheduled':
        return {
          title: 'Follow-up Reminder Scheduled',
          icon: CalendarClock,
          bg: '#f0f9ff',
          color: '#0284c7',
          borderColor: '#bae6fd',
        };
      case 'follow_up_completed':
        return {
          title: 'Follow-up Task Completed',
          icon: CheckCircle2,
          bg: '#ecfdf5',
          color: '#059669',
          borderColor: '#a7f3d0',
        };
      case 'note_added':
        return {
          title: 'Interaction Note Logged',
          icon: MessageSquare,
          bg: '#fffbeb',
          color: '#d97706',
          borderColor: '#fde68a',
        };
      default:
        return {
          title: 'Activity Logged',
          icon: Clock,
          bg: '#f8fafc',
          color: '#64748b',
          borderColor: '#e2e8f0',
        };
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Loading student interaction history...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Clock size={36} color="#94a3b8" style={{ marginBottom: '0.75rem', display: 'inline-block' }} />
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          No Activity Logged Yet
        </p>
        <p style={{ fontSize: '0.8rem', maxWidth: '320px', margin: '0 auto' }}>
          Interaction events, follow-ups, and notes will automatically build an immutable timeline here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
      {/* Continuous vertical timeline connector line */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          bottom: '20px', 
          left: '15px', 
          width: '2px', 
          background: '#e2e8f0' 
        }} 
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activities.map((act) => {
          const cfg = getEventConfig(act.activity_type);
          const Icon = cfg.icon;
          const actorName = act.actor_profile?.full_name || 'Staff Member';
          const actorRole = act.actor_profile?.role 
            ? act.actor_profile.role.charAt(0).toUpperCase() + act.actor_profile.role.slice(1)
            : '';

          return (
            <div key={act.id} style={{ position: 'relative' }} className="fade-in-slide">
              {/* Event Icon Node */}
              <div
                style={{
                  position: 'absolute',
                  left: '-2rem',
                  top: '0px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: cfg.bg,
                  border: `2px solid ${cfg.borderColor}`,
                  color: cfg.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  zIndex: 2,
                }}
              >
                <Icon size={16} />
              </div>

              {/* Event Content Box */}
              <div
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.85rem 1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {cfg.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} title={new Date(act.created_at).toLocaleString()}>
                    {getRelativeTime(act.created_at)}
                  </span>
                </div>

                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                  {act.description}
                </p>

                {/* Additional Metadata Details if Lost Reason or Specific info */}
                {Boolean(act.metadata?.lost_reason) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '0.45rem', padding: '0.35rem 0.65rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.75rem' }}>
                    <AlertTriangle size={12} />
                    <span>Lost Reason: <strong>{String(act.metadata?.lost_reason)}</strong></span>
                  </div>
                )}

                {/* Author Attribution Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                  <User size={11} />
                  <span>By <strong>{actorName}</strong> {actorRole ? `(${actorRole})` : ''}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
