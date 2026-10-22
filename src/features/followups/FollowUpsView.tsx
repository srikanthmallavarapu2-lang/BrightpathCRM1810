import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  ClockAlert, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  RefreshCw, 
  AlertCircle,
  Phone,
  Check
} from 'lucide-react';
import { FollowUp } from '../../types/database';
import { followUpService } from '../../services/followUpService';
import { ScheduleFollowUpModal } from './ScheduleFollowUpModal';

interface FollowUpsViewProps {
  onScheduleCountChange?: (count: number) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({ onScheduleCountChange }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchFollowUps = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const { followUps: data, error } = await followUpService.getFollowUps();

    if (error) {
      setErrorMessage(error);
    } else {
      setFollowUps(data);
      const overdue = data.filter(
        (f) => f.status === 'pending' && new Date(f.due_at) < new Date()
      ).length;
      if (onScheduleCountChange) {
        onScheduleCountChange(overdue);
      }
    }
    setIsLoading(false);
  }, [onScheduleCountChange]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const handleMarkDone = async (id: string) => {
    setCompletingId(id);
    const { success, error } = await followUpService.completeFollowUp(id);
    if (success) {
      await fetchFollowUps();
    } else {
      alert(error || 'Failed to complete follow-up.');
    }
    setCompletingId(null);
  };

  const now = new Date();
  const overdueTasks = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at) < now
  );
  const upcomingTasks = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at) >= now
  );
  const completedTasks = followUps.filter((f) => f.status === 'completed');

  const formatDueTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Scheduled Follow-ups
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Manage upcoming student reminders, admissions calls, and overdue actions from live Supabase.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={fetchFollowUps} 
            className="btn btn-outline" 
            title="Refresh tasks from Supabase"
            style={{ padding: '0.55rem 0.75rem' }}
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
            <span>Sync</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <RefreshCw size={20} className="spin" color="#2563eb" />
            <span>Querying live Supabase follow-up schedule...</span>
          </div>
        </div>
      ) : followUps.length === 0 ? (
        /* Zero follow-ups empty state */
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div 
            style={{ 
              width: 56, 
              height: 56, 
              borderRadius: 'var(--radius-full)', 
              background: '#eff6ff', 
              color: '#2563eb', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Clock size={28} />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            No Follow-up Reminders Scheduled
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1.25rem auto' }}>
            Your follow-up queue is clear! Schedule reminders to call, email, or demo prospective students to keep your admissions pipeline active.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <Plus size={16} />
            <span>Schedule First Follow-up</span>
          </button>
        </div>
      ) : (
        <>
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ClockAlert size={18} color="#dc2626" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626' }}>
                  Overdue Follow-ups (Action Required)
                </h3>
                <span className="status-badge lost" style={{ marginLeft: 'auto' }}>
                  {overdueTasks.length} {overdueTasks.length === 1 ? 'Task' : 'Tasks'} Overdue
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {overdueTasks.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: '#fef2f2',
                      border: '1px solid #fee2e2',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {item.lead?.full_name || 'Prospect Lead'}
                        </span>
                        {item.lead?.phone && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={11} /> {item.lead.phone}
                          </span>
                        )}
                        {item.lead?.course_interest && (
                          <span style={{ fontSize: '0.75rem', padding: '1px 6px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
                            {item.lead.course_interest}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#991b1b', marginTop: '0.25rem' }}>
                        {item.note}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Clock size={12} /> Due: {formatDueTime(item.due_at)} (Overdue)
                      </div>
                    </div>

                    <button
                      disabled={completingId === item.id}
                      onClick={() => handleMarkDone(item.id)}
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '4px' }}
                    >
                      <Check size={14} />
                      <span>{completingId === item.id ? 'Saving...' : 'Mark Done'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Follow-ups Section */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Calendar size={18} color="#2563eb" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Upcoming Follow-ups
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {upcomingTasks.length} {upcomingTasks.length === 1 ? 'task' : 'tasks'} scheduled
              </span>
            </div>

            {upcomingTasks.length === 0 ? (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
                No upcoming follow-ups scheduled for future dates.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingTasks.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {item.lead?.full_name || 'Prospect Lead'}
                        </span>
                        {item.lead?.phone && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={11} /> {item.lead.phone}
                          </span>
                        )}
                        {item.lead?.course_interest && (
                          <span style={{ fontSize: '0.75rem', padding: '1px 6px', background: '#eff6ff', color: '#2563eb', borderRadius: '4px' }}>
                            {item.lead.course_interest}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {item.note}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Due: {formatDueTime(item.due_at)}
                      </div>
                    </div>

                    <button
                      disabled={completingId === item.id}
                      onClick={() => handleMarkDone(item.id)}
                      className="btn btn-outline"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '4px' }}
                    >
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span>{completingId === item.id ? 'Saving...' : 'Mark Done'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed History (if any) */}
          {completedTasks.length > 0 && (
            <div className="card" style={{ opacity: 0.85 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={16} color="#059669" />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
                  Recently Completed ({completedTasks.length})
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {completedTasks.slice(0, 5).map((item) => (
                  <div key={item.id} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      <strong style={{ color: 'var(--text-main)' }}>{item.lead?.full_name}:</strong> {item.note}
                    </span>
                    <span>Completed</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Schedule Modal */}
      <ScheduleFollowUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScheduled={fetchFollowUps}
      />
    </div>
  );
};
