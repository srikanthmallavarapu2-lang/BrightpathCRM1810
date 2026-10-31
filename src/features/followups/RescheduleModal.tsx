import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Check, AlertCircle } from 'lucide-react';
import { FollowUp } from '../../types/database';
import { followUpService } from '../../services/followUpService';
import { useToast } from '../../context/ToastContext';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  followUp: FollowUp | null;
  onRescheduled: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  followUp,
  onRescheduled,
}) => {
  const [newDueAt, setNewDueAt] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && followUp) {
      // Default to 1 day from now at same hour or next morning
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      nextDate.setHours(11, 0, 0, 0);

      const localIso = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setNewDueAt(localIso);
      setReason('');
      setErrorMessage(null);
    }
  }, [isOpen, followUp]);

  if (!isOpen || !followUp) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDueAt) {
      setErrorMessage('Please select a new date and time.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const parsedIso = new Date(newDueAt).toISOString();
      const result = await followUpService.rescheduleFollowUp(
        followUp.id,
        parsedIso,
        reason.trim() || undefined
      );

      if (result.success) {
        toast.success('Follow-up task rescheduled successfully.');
        onRescheduled();
        onClose();
      } else {
        toast.error(result.error || 'Failed to reschedule follow-up.');
        setErrorMessage(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 140,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card fade-in-slide"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="reschedule-modal-title"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarClock size={20} />
            </div>
            <div>
              <h3 id="reschedule-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Reschedule Follow-up
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Student: <strong>{followUp.lead?.full_name || 'Prospect'}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Current Objective
            </label>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {followUp.note}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              New Due Date &amp; Time *
            </label>
            <input
              type="datetime-local"
              required
              value={newDueAt}
              onChange={(e) => setNewDueAt(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Reason for Postponing (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Student was busy in exams, asked to call back next Monday..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <Check size={16} />
              <span>{isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
