import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  CalendarClock, 
  Phone, 
  GraduationCap, 
  User, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import { FollowUp } from '../../types/database';
import { OverdueBadge } from '../../components/common/OverdueBadge';
import { UserAvatar } from '../../components/common/UserAvatar';

export interface ActionCenterProps {
  followUps: FollowUp[];
  isLoading?: boolean;
  onCompleteFollowUp: (id: string) => Promise<void>;
  onRescheduleFollowUp: (followUp: FollowUp) => void;
  onViewLead: (leadId: string, leadName: string) => void;
  onNavigateToAllFollowUps: () => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  followUps,
  isLoading = false,
  onCompleteFollowUp,
  onRescheduleFollowUp,
  onViewLead,
  onNavigateToAllFollowUps,
}) => {
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleMarkDone = async (id: string) => {
    try {
      setCompletingId(id);
      await onCompleteFollowUp(id);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      {/* Action Center Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '0.75rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: followUps.length > 0 ? '#fef2f2' : '#ecfdf5',
              color: followUps.length > 0 ? '#dc2626' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {followUps.length > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              Urgent Action Center
            </h3>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
              {followUps.length > 0 
                ? `${followUps.length} overdue student enquiry reminders require immediate outreach`
                : 'All scheduled follow-ups are on track'}
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToAllFollowUps}
          className="btn btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', gap: '4px' }}
        >
          <span>View All Tasks</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} className="spin" color="#2563eb" />
            <span>Scanning urgent follow-ups...</span>
          </div>
        </div>
      ) : followUps.length === 0 ? (
        /* Zero Overdue Celebration State */
        <div
          style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(5, 150, 105, 0.02))',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={22} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
            All Caught Up! Zero Overdue Follow-ups
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
            Every pending student reminder is current. Keep up the great pace and maintain quick response times with new prospective students.
          </p>
        </div>
      ) : (
        /* Actionable Overdue Items List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {followUps.map((f) => {
            const isCompleting = completingId === f.id;
            const studentName = f.lead?.full_name || 'Student Enquiry';

            return (
              <div
                key={f.id}
                className="fade-in-slide"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #fee2e2',
                  borderLeft: '4px solid #ef4444',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                {/* Left details */}
                <div style={{ flex: '1', minWidth: '240px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <UserAvatar name={studentName} size={36} />
                  <div style={{ flex: '1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <button
                        onClick={() => onViewLead(f.lead_id, studentName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: '#1d4ed8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textAlign: 'left',
                        }}
                        title="View Student Dossier"
                      >
                        <span style={{ textDecoration: 'underline', textDecorationColor: '#93c5fd' }}>
                          {studentName}
                        </span>
                        <ExternalLink size={12} color="#2563eb" />
                      </button>

                      {f.lead?.course_interest && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <GraduationCap size={11} />
                          {f.lead.course_interest}
                        </span>
                      )}

                      <OverdueBadge dueAt={f.due_at} showRelativeTime={true} />
                    </div>

                    {/* Note message */}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500, marginBottom: '0.45rem' }}>
                      &ldquo;{f.note}&rdquo;
                    </p>

                    {/* Metadata strip: phone & assignee */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                      {f.lead?.phone && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} color="#2563eb" />
                          <strong>{f.lead.phone}</strong>
                        </span>
                      )}

                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <User size={12} />
                        Assignee: {f.assigned_profile?.full_name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right instant actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {f.lead?.phone && (
                    <button
                      onClick={() => {
                        const cleanPhone = f.lead!.phone.replace(/[^0-9]/g, '');
                        const msg = encodeURIComponent(
                          `Hello ${studentName}! 👋 This is your admissions advisor from BrightPath Academy following up regarding your scheduled consultation (${f.note}). Please let us know if this time works for you!`
                        );
                        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                      }}
                      className="btn btn-outline"
                      style={{
                        fontSize: '0.785rem',
                        padding: '0.4rem 0.75rem',
                        gap: '4px',
                        color: '#16a34a',
                        borderColor: '#bbf7d0',
                        background: '#f0fdf4',
                      }}
                      title="Send WhatsApp Follow-up Reminder"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp Ping</span>
                    </button>
                  )}

                  <button
                    onClick={() => onRescheduleFollowUp(f)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.785rem', padding: '0.4rem 0.75rem', gap: '4px' }}
                    title="Reschedule this task"
                  >
                    <CalendarClock size={14} color="#64748b" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    onClick={() => handleMarkDone(f.id)}
                    disabled={isCompleting}
                    className="btn btn-primary"
                    style={{
                      fontSize: '0.785rem',
                      padding: '0.4rem 0.85rem',
                      gap: '4px',
                      background: '#16a34a',
                      borderColor: '#15803d',
                    }}
                    title="Mark task completed and log activity"
                  >
                    <CheckCircle2 size={14} />
                    <span>{isCompleting ? 'Saving...' : 'Mark Done'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

