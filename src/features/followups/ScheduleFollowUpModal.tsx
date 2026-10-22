import React, { useState, useEffect } from 'react';
import { X, Clock, Check, AlertCircle } from 'lucide-react';
import { followUpService } from '../../services/followUpService';
import { leadService } from '../../services/leadService';
import { Lead } from '../../types/database';

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  initialLeadId?: string;
}

export const ScheduleFollowUpModal: React.FC<ScheduleFollowUpModalProps> = ({
  isOpen,
  onClose,
  onScheduled,
  initialLeadId,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId || '');
  const [dueAt, setDueAt] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Default to tomorrow 10:00 AM
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      // format for datetime-local: YYYY-MM-DDTHH:mm
      const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDueAt(localIso);
      setNote('');
      setErrorMessage(null);

      // Load active leads
      leadService.getLeads().then(({ leads: data }) => {
        setLeads(data);
        if (!selectedLeadId && data.length > 0) {
          setSelectedLeadId(data[0].id);
        }
      });
    }
  }, [isOpen, selectedLeadId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedLeadId) {
      setErrorMessage('Please select a student lead.');
      return;
    }

    if (!dueAt) {
      setErrorMessage('Please specify when this follow-up is due.');
      return;
    }

    if (!note.trim()) {
      setErrorMessage('Please provide a follow-up task or discussion objective.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedDate = new Date(dueAt).toISOString();
      const result = await followUpService.createFollowUp({
        lead_id: selectedLeadId,
        due_at: parsedDate,
        note: note.trim(),
      });

      if (result.followUp) {
        onScheduled();
        onClose();
      } else {
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
        zIndex: 135,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div 
        className="card fade-in-slide"
        style={{
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="schedule-modal-title"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h3 id="schedule-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Schedule Follow-up Task
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Set a reminder to contact a prospective student enquiry
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Student Lead Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Student Enquiry *
            </label>
            {leads.length === 0 ? (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', padding: '0.5rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                No student enquiries found. Create an enquiry first.
              </div>
            ) : (
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'white',
                  fontSize: '0.875rem',
                }}
              >
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.full_name} ({lead.course_interest}) &mdash; {lead.phone}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Due Date & Time */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Due Date & Time *
            </label>
            <div style={{ position: 'relative' }}>
              <Clock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="datetime-local"
                required
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Follow-up Note */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Discussion Objective / Task *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Call student to discuss syllabus, course fee payment plans, or schedule campus demo..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
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

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || leads.length === 0} 
              className="btn btn-primary" 
              style={{ fontSize: '0.85rem' }}
            >
              <Check size={16} />
              <span>{isSubmitting ? 'Scheduling...' : 'Save Follow-up'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
