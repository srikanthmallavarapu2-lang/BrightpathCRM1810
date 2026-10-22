import React, { useState } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';

interface LostReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string;
  onConfirm: (reason: string) => Promise<void>;
}

export const LostReasonModal: React.FC<LostReasonModalProps> = ({
  isOpen,
  onClose,
  leadName,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState('Joined competitor institute');
  const [customDetail, setCustomDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customDetail.trim() 
      ? `${selectedReason}: ${customDetail.trim()}`
      : selectedReason;

    if (!finalReason.trim()) {
      setError('Please provide a reason before marking this enquiry as Lost.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(finalReason);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)',
          padding: '1.75rem',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="lost-modal-title"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 'var(--radius-md)', 
                background: '#fef2f2', 
                color: '#ef4444', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #fee2e2'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 id="lost-modal-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Mark Lead as Lost
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Student: <strong>{leadName}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', background: '#fef2f2', color: '#b91c1c', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Primary Reason *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'white',
                fontSize: '0.875rem',
              }}
            >
              <option value="Joined competitor institute">Joined competitor institute</option>
              <option value="Fee structure / budget constraint">Fee structure / budget constraint</option>
              <option value="Schedule / timing conflict">Schedule / timing conflict</option>
              <option value="Relocated / distance to campus">Relocated / distance to campus</option>
              <option value="Curriculum mismatch">Curriculum mismatch</option>
              <option value="Decided not to pursue course now">Decided not to pursue course now</option>
              <option value="Unreachable after multiple attempts">Unreachable after multiple attempts</option>
              <option value="Other">Other reason</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Counsellor Notes & Context (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide specific notes regarding why the student decided not to enroll..."
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
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
              style={{ background: '#ef4444', borderColor: '#ef4444', fontSize: '0.85rem' }}
            >
              <Check size={16} />
              <span>{isSubmitting ? 'Recording...' : 'Confirm & Mark Lost'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
