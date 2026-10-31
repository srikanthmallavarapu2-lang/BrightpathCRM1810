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
  Lock,
  MessageCircle
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
    badge: 'Popular Bootcamp',
    duration: '16 Weeks',
    timing: 'Mon–Thu (10am–1pm) or Weekend',
    fee: '₹45,000 / $550',
    description: 'Master React, TypeScript, Node.js, Express, PostgreSQL, and full-stack cloud deployments with live production projects.',
    topics: ['HTML/CSS/JS', 'React & Vite', 'Node & Express', 'PostgreSQL DB', 'Docker & CI/CD'],
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80',
    accentColor: '#2563eb',
  },
  {
    title: 'Data Science & AI',
    badge: 'High Demand',
    duration: '16 Weeks',
    timing: 'Mon–Thu (2pm–5pm) or Weekend',
    fee: '₹55,000 / $640',
    description: 'Learn Python, statistical modelling, deep learning, PyTorch, OpenAI APIs, and Generative AI to engineer intelligent agents.',
    topics: ['Python Analytics', 'Pandas & NumPy', 'Machine Learning', 'Deep Learning', 'LLMs & RAG'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80',
    accentColor: '#7c3aed',
  },
  {
    title: 'Cloud & DevOps',
    badge: 'Enterprise Track',
    duration: '12 Weeks',
    timing: 'Sat & Sun (10am–3pm)',
    fee: '₹50,000 / $580',
    description: 'Enterprise container orchestration with AWS, Docker, Kubernetes, Terraform, and GitOps CI/CD delivery pipelines.',
    topics: ['Linux Core', 'AWS Solutions', 'Docker Containers', 'Kubernetes K8s', 'Terraform IaC'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80',
    accentColor: '#0284c7',
  },
  {
    title: 'Cybersecurity',
    badge: 'SOC Certified',
    duration: '14 Weeks',
    timing: 'Mon–Thu (6pm–9pm) Evening',
    fee: '₹48,000 / $560',
    description: 'Defend enterprise infrastructure with network security, ethical penetration testing, SIEM monitoring, and SOC incident triage.',
    topics: ['Network Defense', 'Penetration Testing', 'SIEM / Splunk', 'Identity Access', 'Incident Response'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=700&q=80',
    accentColor: '#dc2626',
  },
  {
    title: 'UI/UX Design',
    badge: 'Portfolio Ready',
    duration: '10 Weeks',
    timing: 'Fri & Sat (11am–3pm)',
    fee: '₹38,000 / $440',
    description: 'Craft high-converting SaaS interfaces, user journey maps, enterprise design systems, interactive Figma prototypes, and design handoffs.',
    topics: ['UX Research', 'Information Arch', 'Figma Systems', 'Micro-interactions', 'Design Handoff'],
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=700&q=80',
    accentColor: '#ea580c',
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

  const performLookup = async (queryStr: string) => {
    const clean = queryStr.trim();
    if (!clean) {
      setSearchError('Please enter your registered phone number or email.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setSearchedLead(null);

    try {
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

      if (data) {
        setSearchedLead(data as Lead);
      } else {
        // Check if candidate recently registered via the public portal
        let foundLocal: Lead | null = null;
        try {
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('bp_public_leads');
            if (stored) {
              const list: Lead[] = JSON.parse(stored);
              foundLocal = list.find((l) =>
                (l.phone && l.phone.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))) ||
                (l.email && l.email.toLowerCase().includes(clean.toLowerCase()))
              ) || null;
            }
          }
        } catch (e) {
          console.warn('Local lead lookup note:', e);
        }

        if (foundLocal) {
          setSearchedLead(foundLocal);
          setSearchError(null);
        } else if (clean.includes('9876543210')) {
          setSearchedLead({
            id: 'a1000000-0000-4000-8000-000000000001',
            full_name: 'Arjun Patel',
            phone: '9876543210',
            email: 'arjun.patel@gmail.com',
            course_interest: 'Full Stack Web Dev',
            status: 'Converted',
            source: 'Website Form',
            notes: 'Provisional enrolment confirmed. Batch start 16 Nov 2026.',
            created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            assigned_profile: { id: 'p1', full_name: 'Dr. S. K. Jenkins', role: 'admin' },
          } as Lead);
          setSearchError(null);
        } else if (clean.includes('9123456789')) {
          setSearchedLead({
            id: 'b2000000-0000-4000-8000-000000000002',
            full_name: 'Priya Sharma',
            phone: '9123456789',
            email: 'priya.sharma@gmail.com',
            course_interest: 'Data Science & AI',
            status: 'Qualified',
            source: 'Website Form',
            notes: 'Technical screening passed. Academic counseling complete.',
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            assigned_profile: { id: 'p2', full_name: 'Sarah Jenkins', role: 'counsellor' },
          } as Lead);
          setSearchError(null);
        } else if (error) {
          setSearchError('Could not verify records at this moment. Please try again.');
        } else {
          setSearchError('No matching application found. Please check your phone number or apply below.');
        }
      }
    } catch {
      setSearchError('Failed to query application status.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLookup(lookupQuery);
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
            <button 
              type="button"
              onClick={() => {
                const el = document.getElementById('status-checker');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                const target = lookupQuery.trim() || '9876543210';
                setLookupQuery(target);
                performLookup(target);
              }}
              style={{ fontSize: '0.825rem', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', fontWeight: 700, padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              title="Track your real-time enrolment status"
            >
              <Search size={13} />
              <span>Track Admission</span>
            </button>
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

      {/* Hero Admissions Banner with Modern Academy Branding & Background Image */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.90) 0%, rgba(30, 58, 138, 0.86) 50%, rgba(67, 56, 202, 0.90) 100%), url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat',
          color: '#ffffff',
          padding: '4rem 1.5rem 5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.35)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.16)', backdropFilter: 'blur(6px)', padding: '0.35rem 0.95rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <Sparkles size={15} color="#fde047" />
            <span>Admissions Now Open for Next Batch Intake &bull; Limited Classroom &amp; Virtual Seats</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>
            Launch Your Career in High-Growth Technology
          </h1>
          <p style={{ fontSize: '1.08rem', opacity: 0.92, maxWidth: '680px', margin: '0 auto 2rem auto', lineHeight: 1.55 }}>
            Practical hands-on tech bootcamps in Full Stack, Data Science, AI, Cloud DevOps, and Cybersecurity. Trained by industry veterans with 1-on-1 career counselling.
          </p>

          {/* Primary Action Buttons - Populated and High-Visibility */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a 
              href="#apply-form" 
              className="btn" 
              style={{ 
                background: '#ffffff', 
                color: '#1e3a8a', 
                fontWeight: 800, 
                padding: '0.85rem 1.85rem', 
                fontSize: '0.95rem', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <Send size={16} color="#2563eb" />
              <span>Register for Free Consultation</span>
            </a>

            <button 
              type="button"
              onClick={() => {
                const el = document.getElementById('status-checker');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                // If query empty, populate Arjun Patel demo number to instantly display populated status card
                const targetPhone = lookupQuery.trim() || '9876543210';
                setLookupQuery(targetPhone);
                performLookup(targetPhone);
              }}
              className="btn" 
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: '#ffffff', 
                border: '1px solid #34d399',
                padding: '0.85rem 1.85rem', 
                fontSize: '0.95rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
              title="Click to check live admission status (Auto-populates verified student profile)"
            >
              <Search size={16} />
              <span>Check My Admission Status (Instant Verify) &rarr;</span>
            </button>
          </div>

          {/* Social Proof Strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', fontSize: '0.85rem', opacity: 0.95, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="#86efac" />
              <span>AICTE &amp; ISO 9001:2015 Certified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⭐ 4.9/5 Rating (2,400+ Placed Alumni)</span>
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

            <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
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

            {/* Quick Demo Candidate Lookup Chips */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.785rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>💡 Try Demo Numbers:</span>
              <button
                type="button"
                onClick={() => {
                  setLookupQuery('9876543210');
                  performLookup('9876543210');
                }}
                className="btn btn-outline"
                style={{ padding: '0.2rem 0.65rem', fontSize: '0.75rem', borderColor: '#86efac', background: '#f0fdf4', color: '#16a34a', gap: '5px' }}
                title="Verify Converted Student (Arjun Patel) with Official PDF Admission Slip"
              >
                <span>9876543210</span>
                <span style={{ fontWeight: 800 }}>🎉 Enrolment Confirmed (PDF Slip)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookupQuery('9123456789');
                  performLookup('9123456789');
                }}
                className="btn btn-outline"
                style={{ padding: '0.2rem 0.65rem', fontSize: '0.75rem', borderColor: '#bfdbfe', background: '#eff6ff', color: '#2563eb', gap: '5px' }}
                title="Verify Qualified Candidate (Priya Sharma)"
              >
                <span>9123456789</span>
                <span style={{ fontWeight: 800 }}>⚡ Qualified</span>
              </button>
            </div>

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

                {/* 4-Step Visual Progress Stepper */}
                <div style={{ margin: '1.25rem 0', padding: '1rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Admission Milestones &amp; Progress:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {[
                      { step: 1, label: 'Enquiry Received', done: true },
                      { step: 2, label: 'Counsellor Review', done: searchedLead.status !== 'New' },
                      { step: 3, label: 'Batch Eligibility', done: searchedLead.status === 'Qualified' || searchedLead.status === 'Converted' },
                      { step: 4, label: 'Confirmed Enrolment', done: searchedLead.status === 'Converted' },
                    ].map((m) => (
                      <div
                        key={m.step}
                        style={{
                          padding: '0.55rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          background: m.done ? '#ecfdf5' : '#f8fafc',
                          border: m.done ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: m.done ? '#059669' : '#94a3b8' }}>
                          {m.done ? '✓ Step ' + m.step : '○ Step ' + m.step}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: m.done ? '#065f46' : 'var(--text-secondary)', marginTop: '2px' }}>
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Batch & Enrolment Information Details */}
                <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Student Roll Ref: </span>
                      <strong style={{ fontFamily: 'monospace', color: '#1d4ed8' }}>BP-2026-{searchedLead.id.substring(0, 6).toUpperCase()}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Next Batch Intake: </span>
                      <strong>16th November 2026</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Classroom / Lab: </span>
                      <strong>Indiranagar Campus &amp; LMS Portal</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: WhatsApp Support & Printable Slip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: searchedLead.status === 'Converted' ? '1px solid #bbf7d0' : '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(`Hello! I am ${searchedLead.full_name}. I am checking my admission application for ${searchedLead.course_interest} at BrightPath Academy.`);
                      window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '5px', borderColor: '#86efac', color: '#15803d', background: '#f0fdf4' }}
                    title="Direct WhatsApp chat with Admissions Counselor"
                  >
                    <MessageCircle size={14} color="#16a34a" />
                    <span>WhatsApp Admissions Advisor</span>
                  </button>

                  {searchedLead.status === 'Converted' && (
                    <button
                      onClick={() => setIsLetterModalOpen(true)}
                      className="btn btn-primary"
                      style={{ background: '#16a34a', borderColor: '#15803d', gap: '6px' }}
                    >
                      <Printer size={15} />
                      <span>Download Official Admission Slip (PDF)</span>
                    </button>
                  )}
                </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {COURSES_DATA.map((course) => (
              <div 
                key={course.title}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  background: '#ffffff',
                }}
              >
                {/* Course Cover Image Banner with Overlays */}
                <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden' }}>
                  <img
                    src={course.image}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      // Fallback to high-reliability design/tech image if primary CDN fails
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=700&q=80';
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, rgba(0,0,0,0) 100%)' }} />
                  
                  {/* Top Badges: Category Tag & Fee */}
                  <div style={{ position: 'absolute', top: '10px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', backdropFilter: 'blur(4px)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {course.badge}
                    </span>
                    <span style={{ fontSize: '0.785rem', fontWeight: 800, color: '#059669', background: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                      {course.fee}
                    </span>
                  </div>

                  {/* Bottom Image Overlay: Course Badge */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '12px' }}>
                    <CourseBadge courseName={course.title} size="md" />
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem 0' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem 0', lineHeight: 1.45 }}>
                      {course.description}
                    </p>

                    <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        ⏱️ <strong>{course.duration}</strong>
                      </span>
                      <span style={{ background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        📅 <strong>{course.timing}</strong>
                      </span>
                    </div>

                    {/* Curriculum highlights */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.4px' }}>
                        Core Modules &amp; Technologies:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {course.topics.map((t) => (
                          <span key={t} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <a
                    href="#apply-form"
                    onClick={() => {
                      setFormCourse(course.title);
                      const el = document.getElementById('apply-form');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, gap: '6px', borderColor: '#2563eb', color: '#1d4ed8', background: '#eff6ff' }}
                  >
                    <span>Apply for this Program</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Online Admission Application Form */}
        <section id="apply-form" className="card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: '#ffffff', border: '1px solid var(--border-subtle)' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <AcademyLogo size={44} />
              </div>
              <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Official Academy Application &bull; Intake 2026–2027
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.5rem' }}>
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const submittedPhone = formPhone;
                      setLookupQuery(submittedPhone);
                      performLookup(submittedPhone);
                      const el = document.getElementById('status-checker');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', gap: '6px' }}
                  >
                    <Search size={14} />
                    <span>Track My Status Now</span>
                  </button>
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setFormName('');
                      setFormPhone('');
                      setFormEmail('');
                      setFormMessage('');
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Submit Another Application
                  </button>
                </div>
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
