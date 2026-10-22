import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Phone, 
  CalendarClock, 
  Trash2, 
  Search, 
  ExternalLink,
  Check
} from 'lucide-react';
import { FollowUp } from '../../types/database';
import { OverdueBadge } from '../../components/common/OverdueBadge';
import { useAuth } from '../../context/AuthContext';

export type FollowUpTab = 'all' | 'overdue' | 'today' | 'upcoming' | 'completed';

interface FollowUpListProps {
  followUps: FollowUp[];
  onMarkDone: (id: string) => Promise<void>;
  onReschedule: (followUp: FollowUp) => void;
  onDelete: (id: string) => Promise<void>;
  onViewLead?: (leadId: string, leadName: string) => void;
  onOpenScheduleModal: () => void;
}

export const FollowUpList: React.FC<FollowUpListProps> = ({
  followUps,
  onMarkDone,
  onReschedule,
  onDelete,
  onViewLead,
  onOpenScheduleModal,
}) => {
  const [activeTab, setActiveTab] = useState<FollowUpTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const { isAdmin, isManager } = useAuth();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const isTaskOverdue = (f: FollowUp) => f.status === 'pending' && new Date(f.due_at) < now;
  const isTaskToday = (f: FollowUp) => f.status === 'pending' && f.due_at.startsWith(todayStr);

  // Filter tasks by active tab
  const tabFiltered = followUps.filter((f) => {
    switch (activeTab) {
      case 'overdue':
        return isTaskOverdue(f);
      case 'today':
        return isTaskToday(f);
      case 'upcoming':
        return f.status === 'pending' && new Date(f.due_at) >= now;
      case 'completed':
        return f.status === 'completed';
      case 'all':
      default:
        return f.status === 'pending';
    }
  });

  // Client-side text search
  const filteredTasks = tabFiltered.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      f.note.toLowerCase().includes(q) ||
      (f.lead && f.lead.full_name.toLowerCase().includes(q)) ||
      (f.lead && f.lead.phone.includes(q)) ||
      (f.lead && f.lead.course_interest.toLowerCase().includes(q))
    );
  });

  // Count totals for tab badges
  const overdueCount = followUps.filter(isTaskOverdue).length;
  const todayCount = followUps.filter(isTaskToday).length;
  const activeCount = followUps.filter((f) => f.status === 'pending').length;
  const completedCount = followUps.filter((f) => f.status === 'completed').length;

  const handleMarkDone = async (id: string) => {
    setActionLoadingId(id);
    try {
      await onMarkDone(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, leadName?: string) => {
    if (!window.confirm(`Delete follow-up reminder for "${leadName || 'student'}"?`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await onDelete(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDueDisplay = (dateStr: string) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Navigation Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('all')}
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <span>All Active</span>
              <span style={{ padding: '1px 6px', borderRadius: '10px', background: activeTab === 'all' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', fontSize: '0.7rem' }}>
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`btn ${activeTab === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                padding: '0.4rem 0.75rem', 
                fontSize: '0.8rem',
                backgroundColor: activeTab === 'overdue' ? '#dc2626' : undefined,
                borderColor: activeTab === 'overdue' ? '#dc2626' : undefined,
              }}
            >
              <span>Overdue</span>
              <span style={{ padding: '1px 6px', borderRadius: '10px', background: activeTab === 'overdue' ? 'rgba(255,255,255,0.25)' : '#fee2e2', color: activeTab === 'overdue' ? 'white' : '#b91c1c', fontSize: '0.7rem', fontWeight: 700 }}>
                {overdueCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('today')}
              className={`btn ${activeTab === 'today' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <span>Due Today</span>
              <span style={{ padding: '1px 6px', borderRadius: '10px', background: activeTab === 'today' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', fontSize: '0.7rem' }}>
                {todayCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <span>Upcoming</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <span>Completed</span>
              <span style={{ padding: '1px 6px', borderRadius: '10px', background: activeTab === 'completed' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', fontSize: '0.7rem' }}>
                {completedCount}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', minWidth: '220px', flex: '1', maxWidth: '340px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search student, note, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* List Content */}
      {filteredTasks.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div 
            style={{ 
              width: 52, 
              height: 52, 
              borderRadius: 'var(--radius-full)', 
              background: activeTab === 'overdue' ? '#ecfdf5' : '#f1f5f9', 
              color: activeTab === 'overdue' ? '#059669' : '#64748b', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '0.85rem',
            }}
          >
            {activeTab === 'overdue' ? <CheckCircle2 size={26} /> : <Clock size={26} />}
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
            {searchQuery 
              ? 'No matching follow-ups found' 
              : activeTab === 'overdue' 
              ? 'Zero Overdue Tasks!' 
              : activeTab === 'today'
              ? 'No follow-ups due today'
              : activeTab === 'completed'
              ? 'No completed tasks archived yet'
              : 'No follow-up reminders scheduled'}
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
            {searchQuery
              ? 'Try searching with a different term or clear the search field.'
              : activeTab === 'overdue'
              ? 'All prospective student calls are up-to-date! Great job staying ahead of your admissions schedule.'
              : 'Schedule reminders to keep in contact with potential students across their admission journey.'}
          </p>
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              Clear Search
            </button>
          ) : (
            <button onClick={onOpenScheduleModal} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
              Schedule Follow-up
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTasks.map((item) => {
            const overdue = isTaskOverdue(item);
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="card fade-in-slide"
                style={{
                  padding: '1rem 1.25rem',
                  borderLeft: overdue ? '4px solid #ef4444' : isCompleted ? '4px solid #10b981' : '4px solid #3b82f6',
                  background: overdue ? '#fff8f8' : isCompleted ? '#fafdfb' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                }}
              >
                {/* Left details */}
                <div style={{ flex: '1', minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    {/* Clickable student name */}
                    {item.lead ? (
                      <button
                        onClick={() => onViewLead && onViewLead(item.lead!.id, item.lead!.full_name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 700,
                          color: 'var(--primary-700)',
                          fontSize: '0.95rem',
                          textDecoration: 'none',
                        }}
                        title="View student in Leads Pipeline"
                      >
                        <span>{item.lead.full_name}</span>
                        <ExternalLink size={12} color="#2563eb" />
                      </button>
                    ) : (
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        Student Enquiry
                      </span>
                    )}

                    {item.lead?.phone && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Phone size={12} /> {item.lead.phone}
                      </span>
                    )}

                    {item.lead?.course_interest && (
                      <span style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', fontWeight: 500 }}>
                        {item.lead.course_interest}
                      </span>
                    )}

                    {/* Overdue Badge */}
                    {overdue && <OverdueBadge dueAt={item.due_at} />}
                  </div>

                  {/* Task note */}
                  <p style={{ fontSize: '0.875rem', color: overdue ? '#7f1d1d' : 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                    {item.note}
                  </p>

                  {/* Timestamp & Assignee info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: overdue ? '#dc2626' : undefined, fontWeight: overdue ? 600 : 400 }}>
                      <Clock size={12} />
                      <span>{isCompleted ? `Completed: ${formatDueDisplay(item.completed_at || item.due_at)}` : `Due: ${formatDueDisplay(item.due_at)}`}</span>
                    </div>

                    {item.assigned_profile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>&bull; Assignee: <strong>{item.assigned_profile.full_name || 'Staff'}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!isCompleted && (
                    <>
                      <button
                        onClick={() => onReschedule(item)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.785rem', padding: '0.4rem 0.75rem', gap: '4px' }}
                        title="Change scheduled date/time"
                      >
                        <CalendarClock size={13} />
                        <span>Reschedule</span>
                      </button>

                      <button
                        disabled={actionLoadingId === item.id}
                        onClick={() => handleMarkDone(item.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.785rem', padding: '0.4rem 0.85rem', gap: '4px' }}
                      >
                        <Check size={14} />
                        <span>{actionLoadingId === item.id ? 'Saving...' : 'Mark Done'}</span>
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <span style={{ fontSize: '0.75rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  )}

                  {(isAdmin || isManager) && (
                    <button
                      disabled={actionLoadingId === item.id}
                      onClick={() => handleDelete(item.id, item.lead?.full_name)}
                      className="btn-icon"
                      style={{ width: 32, height: 32, color: '#ef4444' }}
                      title="Delete reminder (Admin/Manager)"
                      aria-label="Delete follow-up reminder"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
