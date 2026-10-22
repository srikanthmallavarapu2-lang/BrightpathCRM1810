import React, { useState, useEffect } from 'react';
import { X, Check, User, Phone, Mail } from 'lucide-react';
import { Lead, LeadStatus, Profile } from '../../types/database';
import { leadService, CreateLeadInput } from '../../services/leadService';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadSaved: () => void;
  leadToEdit?: Lead | null;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onLeadSaved,
  leadToEdit = null,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [courseInterest, setCourseInterest] = useState('Full Stack Web Dev');
  const [source, setSource] = useState('Website Form');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [assignedTo, setAssignedTo] = useState('');
  const [staffProfiles, setStaffProfiles] = useState<Profile[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    leadService.getStaffProfiles().then(({ profiles }) => {
      if (profiles && profiles.length > 0) {
        setStaffProfiles(profiles);
      }
    });
  }, []);

  useEffect(() => {
    if (leadToEdit) {
      setFullName(leadToEdit.full_name);
      setPhone(leadToEdit.phone);
      setEmail(leadToEdit.email || '');
      setCourseInterest(leadToEdit.course_interest);
      setSource(leadToEdit.source);
      setStatus(leadToEdit.status);
      setAssignedTo(leadToEdit.assigned_to || '');
      setNotes(leadToEdit.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setCourseInterest('Full Stack Web Dev');
      setSource('Website Form');
      setStatus('New');
      setAssignedTo('');
      setNotes('');
    }
    setErrorMessage(null);
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Student Full Name is required.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Phone Number is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (leadToEdit) {
        // Edit existing lead
        const result = await leadService.updateLead(leadToEdit.id, {
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          course_interest: courseInterest,
          source,
          status,
          notes: notes.trim() || null,
          assigned_to: assignedTo.trim() ? assignedTo : null,
        });

        if (result.success) {
          onLeadSaved();
          onClose();
        } else {
          setErrorMessage(result.error);
        }
      } else {
        // Create new lead
        const input: CreateLeadInput = {
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          course_interest: courseInterest,
          source,
          status,
          notes: notes.trim() || null,
          assigned_to: assignedTo.trim() ? assignedTo : null,
        };

        const result = await leadService.createLead(input);

        if (result.lead) {
          onLeadSaved();
          onClose();
        } else {
          setErrorMessage(result.error);
        }
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
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="lead-modal-title"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <div>
            <h3 id="lead-modal-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {leadToEdit ? 'Edit Student Enquiry' : 'Record New Student Enquiry'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {leadToEdit ? 'Update details in live Supabase database' : 'Add student enquiry to admissions pipeline'}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Student Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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

          {/* Contact Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Phone Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
          </div>

          {/* Course Interest & Lead Source */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Course Interest *
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={courseInterest}
                  onChange={(e) => setCourseInterest(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.875rem',
                    background: 'white',
                  }}
                >
                  <option value="Full Stack Web Dev">Full Stack Web Dev</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                  <option value="Cybersecurity Fundamentals">Cybersecurity Fundamentals</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Enquiry Source *
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                  background: 'white',
                }}
              >
                <option value="Website Form">Website Form</option>
                <option value="Walk-in Visit">Walk-in Visit</option>
                <option value="Inbound Phone Call">Inbound Phone Call</option>
                <option value="Student Referral">Student Referral</option>
              </select>
            </div>
          </div>

          {/* Initial Status (if editing) */}
          {leadToEdit && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                  background: 'white',
                }}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          )}

          {/* Assigned Counsellor */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Assigned Counsellor
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.875rem',
                background: 'white',
              }}
            >
              <option value="">Auto-Assign to Current User / Unassigned</option>
              {staffProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || 'Staff Member'} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Counsellor Interaction Notes
            </label>
            <textarea
              rows={3}
              placeholder="Record preliminary counselling notes, student career aspirations, or background..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              disabled={isSubmitting} 
              className="btn btn-primary" 
              style={{ fontSize: '0.85rem' }}
            >
              <Check size={16} />
              <span>{isSubmitting ? 'Saving to Database...' : leadToEdit ? 'Save Changes' : 'Save Student Enquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
