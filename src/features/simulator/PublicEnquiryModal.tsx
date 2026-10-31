import React, { useState, useEffect } from 'react';
import { X, Send, Globe, Sparkles, AlertCircle } from 'lucide-react';
import { leadService } from '../../services/leadService';
import { useToast } from '../../context/ToastContext';
import { AcademyLogo } from '../../components/common/AcademyLogo';

export interface PublicEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadIngested?: () => void;
}

export const PublicEnquiryModal: React.FC<PublicEnquiryModalProps> = ({
  isOpen,
  onClose,
  onLeadIngested,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [courseInterest, setCourseInterest] = useState('Full Stack Web Dev');
  const [studyMode, setStudyMode] = useState('Online Live Interactive');
  const [query, setQuery] = useState('');
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Full name and phone number are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formattedNotes = `[Priority: Hot]\nPreferred Mode: ${studyMode}\nStudent Message: ${query.trim() || 'No specific question entered'}`;

      const { lead, error } = await leadService.createLead({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        course_interest: courseInterest,
        source: 'Website Form',
        status: 'New',
        notes: formattedNotes,
      });

      if (error || !lead) {
        setErrorMessage(error || 'Failed to submit enquiry.');
        toast.error(error || 'Submission failed.');
      } else {
        toast.success(`🎉 Live Website Enquiry Received! ${lead.full_name} registered for ${lead.course_interest}.`);
        if (onLeadIngested) onLeadIngested();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoStudent = () => {
    const demos = [
      { name: 'Aditi Sharma', phone: '+91 98765 43210', email: 'aditi.sharma@gmail.com', course: 'Full Stack Web Dev', mode: 'Classroom Bootcamp', query: 'Does this course include placement assistance and hands-on projects?' },
      { name: 'Rahul Varma', phone: '+91 91234 56789', email: 'rahul.v@outlook.com', course: 'Data Science & AI', mode: 'Online Live Interactive', query: 'What are the batch timings for working professionals?' },
      { name: 'Sneha Patel', phone: '+91 99887 76655', email: 'sneha.patel@yahoo.com', course: 'Cloud & DevOps', mode: 'Weekend Professional', query: 'Can I attend a free demo consultation session first?' },
    ];
    const picked = demos[Math.floor(Math.random() * demos.length)];
    setFullName(picked.name);
    setPhone(picked.phone);
    setEmail(picked.email);
    setCourseInterest(picked.course);
    setStudyMode(picked.mode);
    setQuery(picked.query);
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
        zIndex: 150,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card fade-in-slide dialog-modal-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="simulator-modal-title"
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(79, 70, 229, 0.04))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: '#2563eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Globe size={20} />
            </div>
            <div>
              <h3 id="simulator-modal-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Public Website Enquiry Simulator</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  Live Ingestion
                </span>
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                Simulates prospective students submitting an application on your website
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Visual Campus Hero Strip */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb, #4338ca)',
            padding: '1.25rem 1.5rem',
            color: 'white',
            overflow: 'hidden',
          }}
        >
          {/* Background pattern decoration */}
          <div
            style={{
              position: 'absolute',
              right: '-10px',
              top: '-15px',
              opacity: 0.15,
              pointerEvents: 'none',
            }}
          >
            <AcademyLogo size={120} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Official Student Admissions Portal
              </span>
              <span style={{ fontSize: '0.72rem', color: '#fef08a', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                ⭐ 4.9/5 (2,400+ Alumni)
              </span>
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '2px 0 4px 0', letterSpacing: '-0.2px' }}>
              BrightPath Institute of Technology &amp; AI
            </h4>
            <p style={{ fontSize: '0.785rem', opacity: 0.9, margin: 0, maxWidth: '440px' }}>
              Begin your tech career journey. Register your consultation with our career guidance faculty.
            </p>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMessage && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Fill prospective student inquiry details:
            </span>
            <button
              type="button"
              onClick={handleFillDemoStudent}
              style={{
                fontSize: '0.75rem',
                color: '#2563eb',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#eff6ff',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #bfdbfe',
              }}
            >
              <Sparkles size={12} /> Auto-fill sample student
            </button>
          </div>

          {/* Student Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Email & Course Interest */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Course of Interest
              </label>
              <select
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', background: '#ffffff' }}
              >
                <option value="Full Stack Web Dev">Full Stack Web Dev (React &amp; Node)</option>
                <option value="Data Science & AI">Data Science &amp; AI (Python &amp; ML)</option>
                <option value="Cloud & DevOps">Cloud &amp; DevOps (AWS &amp; Kubernetes)</option>
                <option value="UI/UX Product Design">UI/UX Product Design</option>
                <option value="Cyber Security">Cyber Security &amp; Ethical Hacking</option>
              </select>
            </div>
          </div>

          {/* Preferred Study Mode */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Preferred Learning Mode
            </label>
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', background: '#ffffff' }}
            >
              <option value="Online Live Interactive">Online Live Interactive (Evening Batches)</option>
              <option value="Classroom Bootcamp">Classroom In-Person Bootcamp (Bangalore Campus)</option>
              <option value="Weekend Professional">Weekend Professional Fast-Track</option>
            </select>
          </div>

          {/* Student Question / Message */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Student Question or Comments
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Inquiring about fees installment plans, placement support, and course syllabus..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>

          {/* Footer Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', gap: '6px' }}
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Simulating submission...' : 'Submit Website Enquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
