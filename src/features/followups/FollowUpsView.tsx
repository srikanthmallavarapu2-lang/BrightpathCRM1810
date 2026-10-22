import React from 'react';
import { Clock, ClockAlert, CheckCircle2, Calendar, Plus } from 'lucide-react';

interface FollowUpItem {
  id: string;
  leadName: string;
  phone: string;
  note: string;
  dueAt: string;
  isOverdue: boolean;
  status: 'pending' | 'completed';
}

const SAMPLE_FOLLOWUPS: FollowUpItem[] = [
  {
    id: 'f1',
    leadName: 'Aarav Sharma',
    phone: '+91 98765 43210',
    note: 'Call student to explain Web Dev weekend batch timing and fee structure.',
    dueAt: 'Today at 10:30 AM',
    isOverdue: true,
    status: 'pending',
  },
  {
    id: 'f2',
    leadName: 'Diya Patel',
    phone: '+91 98234 56789',
    note: 'Follow up regarding scholarship test results for AI cohort.',
    dueAt: 'Yesterday at 4:00 PM',
    isOverdue: true,
    status: 'pending',
  },
  {
    id: 'f3',
    leadName: 'Rohan Verma',
    phone: '+91 97123 45678',
    note: 'Confirm seat reservation for Cloud Computing syllabus demo.',
    dueAt: 'Tomorrow at 11:00 AM',
    isOverdue: false,
    status: 'pending',
  },
];

export const FollowUpsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Follow-up Schedule</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Strict overdue rule: Pending tasks past due time are flagged in red.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Overdue Section */}
      <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ClockAlert size={18} color="#dc2626" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626' }}>
            Overdue Follow-ups (Action Required)
          </h3>
          <span className="status-badge lost" style={{ marginLeft: 'auto' }}>
            2 Tasks Pending
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {SAMPLE_FOLLOWUPS.filter(f => f.isOverdue).map((item) => (
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
                    {item.leadName}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ({item.phone})
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#991b1b', marginTop: '0.2rem' }}>
                  {item.note}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginTop: '0.35rem' }}>
                  <Calendar size={12} /> Due: {item.dueAt}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                  <CheckCircle2 size={14} />
                  <span>Mark Done</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Clock size={18} color="#2563eb" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Upcoming Follow-ups
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {SAMPLE_FOLLOWUPS.filter(f => !f.isOverdue).map((item) => (
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
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.leadName}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({item.phone})</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {item.note}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 500, marginTop: '0.35rem' }}>
                  <Calendar size={12} /> Due: {item.dueAt}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                  <CheckCircle2 size={14} />
                  <span>Mark Done</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
