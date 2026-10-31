import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Lock
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { leadService } from '../../services/leadService';
import { Lead } from '../../types/database';
import { AcademyLogo } from '../../components/common/AcademyLogo';
import { CourseBadge } from '../../components/common/CourseBadge';
import { AdmissionLetterModal } from '../leads/AdmissionLetterModal';
import { useToast } from '../../context/ToastContext';

interface StudentPortalViewProps {
  onSwitchToStaff: () => void;
  onOpenStaffAuth?: () => void;
}

const COURSES_DATA = [
  {
    title: 'Full Stack Web Dev',
    duration: '16 Weeks',
    timing: 'Mon–Thu (10am–1pm) or Weekend',
    fee: '₹45,000 / $550',
    description: 'Master React, TypeScript, Node.js, Express, PostgreSQL, and full-stack cloud deployments.',
    topics: ['HTML/CSS/JS', 'React & Vite', 'Node & Express', 'PostgreSQL DB', 'Docker & CI/CD'],
  },
  {
    title: 'Data Science & AI',
    duration: '16 Weeks',
    timing: 'Mon–Thu (2pm–5pm) or Weekend',
    fee: '₹55,000 / $640',
    description: 'Learn Python, statistical modelling, deep learning, PyTorch, OpenAI APIs, and Generative AI.',
    topics: ['Python Analytics', 'Pandas & NumPy', 'Machine Learning', 'Deep Learning', 'LLMs & RAG'],
  },
  {
    title: 'Cloud & DevOps',
    duration: '12 Weeks',
    timing: 'Sat & Sun (10am–3pm)',
    fee: '₹50,000 / $580',
    description: 'Enterprise container orchestration with AWS, Docker, Kubernetes, Terraform, and GitOps pipelines.',
    topics: ['Linux Core', 'AWS Solutions', 'Docker Containers', 'Kubernetes K8s', 'Terraform IaC'],
  },
  {
    title: 'Cybersecurity',
    duration: '14 Weeks',
    timing: 'Mon–Thu (6pm–9pm) Evening',
    fee: '₹48,000 / $560',
    description: 'Defend enterprise infrastructure with network security, ethical penetration testing, and SOC operations.',
    topics: ['Network Defense', 'Penetration Testing', 'SIEM / Splunk', 'Identity Access', 'Incident Response'],
  },
  {
    title: 'UI/UX Design',
    duration: '10 Weeks',
    timing: 'Fri & Sat (11am–3pm)',
    fee: '₹38,000 / $440',
    description: 'Craft high-converting SaaS interfaces, user journey maps, design systems, and Figma prototypes.',
    topics: ['UX Research', 'Information Arch', 'Figma Systems', 'Micro-interactions', 'Design Handoff'],
  },
];

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  onSwitchToStaff,
  onOpenStaffAuth,
}) => {
  // Application Status Lookup
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedLead, setSearchedLead] = useState<Lead | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Admission Slip modal
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  // Online Application Form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCourse, setFormCourse] = useState('Full Stack Web Dev');
  const [formStudyMode, setFormStudyMode] = useState('Online Live Interactive');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toast = useToast();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) {
      setSearchError('Please enter your registered phone number or email.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setSearchedLead(null);

    try {
      const clean = lookupQuery.trim();
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `)
        .or(`phone.ilike.%${clean}%,email.ilike.%${clean}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setSearchError('Could not verify records at this moment. Please try again.');
      } else if (!data) {
        setSearchError('No matching application found. Please check your phone number or apply below.');
      } else {
        setSearchedLead(data as Lead);
      }
    } catch {
      setSearchError('Failed to query application status.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      toast.error('Name and phone number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const notes = `[Priority: Hot]\nPreferred Mode: ${formStudyMode}\nStudent Goal: ${formMessage.trim() || 'Applied via Public Student Portal'}`;
      const { lead, error } = await leadService.createLead({
        full_name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || null,
        course_interest: formCourse,
        source: 'Website Form',
        status: 'New',
        notes,
      });

      if (error || !lead) {
        toast.error(error || 'Failed to submit application.');
      } else {
        setSubmitSuccess(true);
        toast.success('🎉 Application successfully submitted! Our admissions advisor will contact you.');
        setSearchedLead(lead);
        setHasSearched(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Student Portal Navigation Bar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.85rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AcademyLogo size={36} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.3px' }}>
                  BrightPath Academy
                </span>
                <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                  Student &amp; Admissions Portal
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Intake 2026–2027 &bull; Bengaluru Central Campus &bull; ISO 9001:2015
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a 
              href="#status-checker" 
              style={{ fontSize: '0.825rem', color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', padding: '0.4rem 0.75rem' }}
            >
              Track Application
            </a>
            <a 
              href="#courses-catalog" 
              style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', padding: '0.4rem 0.75rem' }}
            >
              View Courses
            </a>
            <a 
              href="#apply-form" 
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              Apply Online
            </a>

            {/* Switch back to Staff CRM */}
            <button
              onClick={() => {
                if (onOpenStaffAuth) onOpenStaffAuth();
                onSwitchToStaff();
              }}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '5px', borderColor: '#cbd5e1' }}
              title="Switch back to Staff & Counsellor Management Workspace"
            >
              <Lock size={13} color="#64748b" />
              <span>Staff CRM</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Admissions Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4338ca 100%)',
          color: '#ffffff',
          padding: '3.5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(6px)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.785rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Sparkles size={14} color="#fde047" />
            <span>Admissions Now Open for Next Batch Intake &bull; Limited Seats</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.2, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>
            Launch Your Career in High-Growth Technology
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '640px', margin: '0 auto 1.75rem auto', lineHeight: 1.5 }}>
            Practical hands-on bootcamps in Full Stack, Data Science, AI, and DevOps. Get trained by industry veterans and achieve your career breakthrough.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a 
              href="#apply-form" 
              className="btn" 
              style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 800, padding: '0.75rem 1.75rem', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              Register for Free Consultation
            </a>
            <a 
              href="#status-checker" 
              className="btn btn-outline" 
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              Check My Admission Status &rarr;
            </a>
          </div>

          {/* Social Proof Strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', fontSize: '0.85rem', opacity: 0.9, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="#86efac" />
              <span>AICTE &amp; ISO 9001 Certified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⭐ 4.9/5 Rating (2,400+ Alumni)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={18} color="#86efac" />
              <span>1-on-1 Dedicated Counsellor Guidance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '-2rem auto 3rem auto', padding: '0 1rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative', zIndex: 10 }}>
        {/* Section 1: Live Application Status Checker */}
        <section 
          id="status-checker" 
          className="card" 
          style={{ 
            padding: '2rem', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            background: '#ffffff'
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Search size={22} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Check Your Admission &amp; Enrolment Status
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enter the phone number or email you used when registering to verify your real-time enrolment status.
            </p>

            <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter phone number (e.g. 9876543210) or email..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '240px',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.9rem',
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontWeight: 700, gap: '6px' }}
              >
                {isSearching ? <Clock size={16} className="spin" /> : <Search size={16} />}
                <span>Verify Status</span>
              </button>
            </form>

            {searchError && (
              <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                <AlertCircle size={18} />
                <span>{searchError}</span>
              </div>
            )}

            {/* Found Record Card */}
            {hasSearched && searchedLead && (
              <div 
                className="fade-in-slide"
                style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: searchedLead.status === 'Converted' ? '#f0fdf4' : '#f8fafc',
                  border: searchedLead.status === 'Converted' ? '1px solid #86efac' : '1px solid var(--border-subtle)',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Candidate Name
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
                      {searchedLead.full_name}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      background: searchedLead.status === 'Converted' ? '#dcfce7' : '#eff6ff',
                      color: searchedLead.status === 'Converted' ? '#15803d' : '#1d4ed8',
                      border: searchedLead.status === 'Converted' ? '1px solid #86efac' : '1px solid #bfdbfe',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {searchedLead.status === 'Converted' ? '🎉 ENROLMENT CONFIRMED' : `Status: ${searchedLead.status}`}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Course:</span>
                    <div style={{ marginTop: '2px' }}>
                      <CourseBadge courseName={searchedLead.course_interest} size="sm" />
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Application Date:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {new Date(searchedLead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admissions Counsellor:</span>
                    <div style={{ fontWeight: 600, color: '#2563eb' }}>
                      {searchedLead.assigned_profile?.full_name || 'Senior Admissions Registrar'}
                    </div>
                  </div>
                </div>

                {searchedLead.status === 'Converted' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #bbf7d0', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                      <strong>Congratulations!</strong> Your admission has been validated and your classroom/portal seat is secured.
                    </div>
                    <button
                      onClick={() => setIsLetterModalOpen(true)}
                      className="btn btn-primary"
                      style={{ background: '#16a34a', borderColor: '#15803d', gap: '6px' }}
                    >
                      <Printer size={15} />
                      <span>Download My Admission Slip (PDF)</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Your application is currently active. Your assigned advisor will be contacting you on <strong>{searchedLead.phone}</strong> with batch timings and demo schedules.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Explore Courses Catalog */}
        <section id="courses-catalog">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              Featured Technology Curricula
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '4px auto 0 auto' }}>
              Comprehensive 12 to 16-week industry-verified programs designed to fast-track your tech career
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {COURSES_DATA.map((course) => (
              <div 
                key={course.title}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <CourseBadge courseName={course.title} size="md" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      {course.fee}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.85rem 0', lineHeight: 1.45 }}>
                    {course.description}
                  </p>

                  <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span>⏱️ Duration: <strong>{course.duration}</strong></span>
                    <span>📅 Schedule: <strong>{course.timing}</strong></span>
                  </div>

                  {/* Curriculum highlights */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Core Modules Included:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {course.topics.map((t) => (
                        <span key={t} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 500 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href="#apply-form"
                  onClick={() => setFormCourse(course.title)}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, gap: '4px' }}
                >
                  <span>Apply for this Course</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Online Admission Application Form */}
        <section id="apply-form" className="card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: '#ffffff', border: '1px solid var(--border-subtle)' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase' }}>
                Online Application
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                Register for Provisional Admission
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Fill out the brief consultation form. Our senior faculty will schedule your 1-on-1 counseling session.
              </p>
            </div>

            {submitSuccess ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #86efac' }}>
                <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', marginBottom: '0.35rem' }}>
                  Application Received Successfully!
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#14532d', maxWidth: '440px', margin: '0 auto 1.25rem auto' }}>
                  Thank you, <strong>{formName}</strong>. Your profile has been queued for evaluation. You can track your status above using your phone number: <strong>{formPhone}</strong>.
                </p>
                <button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setFormName('');
                    setFormPhone('');
                    setFormEmail('');
                    setFormMessage('');
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sanya Sharma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Contact Phone (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. sanya.s@gmail.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Select Desired Course Program *
                    </label>
                    <select
                      value={formCourse}
                      onChange={(e) => setFormCourse(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem', background: '#ffffff' }}
                    >
                      <option value="Full Stack Web Dev">Full Stack Web Dev (16 Weeks)</option>
                      <option value="Data Science & AI">Data Science &amp; AI (16 Weeks)</option>
                      <option value="Cloud & DevOps">Cloud &amp; DevOps (12 Weeks)</option>
                      <option value="Cybersecurity">Cybersecurity (14 Weeks)</option>
                      <option value="UI/UX Design">UI/UX Design (10 Weeks)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Preferred Learning Format
                  </label>
                  <select
                    value={formStudyMode}
                    onChange={(e) => setFormStudyMode(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem', background: '#ffffff' }}
                  >
                    <option value="Online Live Interactive">Online Live Interactive (Virtual Classroom)</option>
                    <option value="Classroom Bootcamp">Classroom Intensive Bootcamp (Bengaluru Campus)</option>
                    <option value="Weekend Professional">Weekend Professional Batch (Working Professionals)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Questions / Career Aspirations
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your background or specific questions regarding syllabus, placement assistance, etc."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800, gap: '8px' }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application & Lock Intake Seat'}</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#1e293b', color: '#94a3b8', padding: '2rem 1.5rem', marginTop: 'auto', borderTop: '1px solid #334155' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AcademyLogo size={24} />
            <span style={{ color: '#ffffff', fontWeight: 700 }}>BrightPath Academy &copy; 2026</span>
            <span>&bull; Registered Centre for Advanced Software &amp; Data Sciences</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Admissions Helpline: <strong>+91 (80) 4567-8900</strong></span>
            <span>Email: <strong>admissions@brightpath.edu</strong></span>
            <button
              onClick={onSwitchToStaff}
              style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
            >
              Staff Portal Access
            </button>
          </div>
        </div>
      </footer>

      {/* Printable Offer Letter Modal */}
      <AdmissionLetterModal
        isOpen={isLetterModalOpen}
        onClose={() => setIsLetterModalOpen(false)}
        lead={searchedLead}
      />
    </div>
  );
};
