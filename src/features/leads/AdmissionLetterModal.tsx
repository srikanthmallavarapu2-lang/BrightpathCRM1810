import React, { useEffect } from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Lead } from '../../types/database';
import { AcademyLogo } from '../../components/common/AcademyLogo';

interface AdmissionLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export const AdmissionLetterModal: React.FC<AdmissionLetterModalProps> = ({
  isOpen,
  onClose,
  lead,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  const admissionNumber = `BP-ADM-${new Date().getFullYear()}-${lead.id.substring(0, 6).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card fade-in-slide"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          background: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="admission-slip-title"
      >
        {/* Modal Controls Toolbar (Hidden when printed) */}
        <div
          className="no-print"
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Official Student Admission Slip
            </span>
            <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
              Confirmed Enrolment
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', gap: '6px' }}
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div
          id="printable-admission-slip"
          style={{
            padding: '2.5rem',
            overflowY: 'auto',
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Document Header with Academy Logo & Seal */}
          <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <AcademyLogo size={52} />
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a8a', margin: 0, letterSpacing: '-0.3px' }}>
                  BRIGHTPATH ACADEMY OF ADVANCED TECHNOLOGY
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  ISO 9001:2015 Certified Centre for Professional Technology Admissions &bull; Intake 2026–2027
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Enrolment Ref:
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                {admissionNumber}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                Issued: {issueDate}
              </div>
            </div>
          </div>

          {/* Certificate Title */}
          <div style={{ textAlign: 'center', margin: '1.75rem 0' }}>
            <h2 id="admission-slip-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Letter of Admission &amp; Enrolment Confirmation
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              This document certifies the provisional admission of the student named below into BrightPath Academy.
            </p>
          </div>

          {/* Student Particulars Table */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, width: '35%', color: '#334155' }}>
                    Student Full Name:
                  </td>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                    {lead.full_name}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Primary Contact Number:
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: '#0f172a' }}>
                    {lead.phone}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Registered Email:
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: '#0f172a' }}>
                    {lead.email || 'N/A (Recorded via Walk-in/Direct Outreach)'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Course / Specialization:
                  </td>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#2563eb' }}>
                    {lead.course_interest}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Assigned Admissions Counsellor:
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: '#0f172a' }}>
                    {lead.assigned_profile?.full_name || 'Senior Admissions Registrar'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Admission Status:
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#047857', fontWeight: 800 }}>
                      <CheckCircle2 size={15} />
                      <span>OFFICIALLY CONFIRMED &amp; SEAT ALLOTTED</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Academic Conditions */}
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '0.85rem 1rem', marginBottom: '2rem', fontSize: '0.785rem', color: '#475569' }}>
            <strong style={{ color: '#0f172a' }}>Enrolment Guidelines &amp; Orientation:</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              1. The candidate must attend the mandatory virtual/classroom onboarding session prior to batch initiation. <br />
              2. Student ID cards, repository credentials, and LMS curriculum access keys will be released within 24 hours of seat confirmation.
            </p>
          </div>

          {/* Signature & Seal Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '2px solid #059669', padding: '0.35rem 0.75rem', borderRadius: '4px', color: '#059669' }}>
                <ShieldCheck size={18} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  BrightPath Official Seal
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '6px', paddingBottom: '4px', fontStyle: 'italic', fontFamily: 'serif', fontSize: '1rem', color: '#1e3a8a' }}>
                Dr. S. K. Jenkins
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Dean of Admissions
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                BrightPath Academy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
