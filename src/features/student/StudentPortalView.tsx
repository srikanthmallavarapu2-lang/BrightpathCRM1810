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
  MessageCircle,
  Star,
  Calculator,
  Building2,
  ChevronDown,
  HelpCircle
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
    description: 'Master modern React, TypeScript, Node.js, Express, PostgreSQL, and full-stack cloud deployments with live production projects.',
    topics: ['HTML5/CSS3/TS', 'React & Vite', 'Node & Express', 'PostgreSQL DB', 'Docker & CI/CD', 'REST & GraphQL'],
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80',
    accentColor: '#2563eb',
    mentor: 'Arun K. (Ex-Amazon)',
    rating: '4.95 (420 reviews)',
  },
  {
    title: 'Data Science & AI',
    badge: 'High Demand',
    duration: '16 Weeks',
    timing: 'Mon–Thu (2pm–5pm) or Weekend',
    fee: '₹55,000 / $640',
    description: 'Learn Python, statistical modelling, deep learning, PyTorch, OpenAI APIs, and Generative AI to engineer intelligent agents.',
    topics: ['Python Analytics', 'Pandas & NumPy', 'Machine Learning', 'Deep Learning', 'LLMs & RAG', 'Vector DBs'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80',
    accentColor: '#7c3aed',
    mentor: 'Dr. Sneha R. (AI Researcher)',
    rating: '4.98 (380 reviews)',
  },
  {
    title: 'Cloud & DevOps',
    badge: 'Enterprise Track',
    duration: '12 Weeks',
    timing: 'Sat & Sun (10am–3pm)',
    fee: '₹50,000 / $580',
    description: 'Enterprise container orchestration with AWS, Docker, Kubernetes, Terraform, and GitOps CI/CD delivery pipelines.',
    topics: ['Linux Core', 'AWS Solutions', 'Docker Containers', 'Kubernetes K8s', 'Terraform IaC', 'Monitoring'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80',
    accentColor: '#0284c7',
    mentor: 'Vikram M. (DevOps Lead)',
    rating: '4.92 (290 reviews)',
  },
  {
    title: 'Cybersecurity',
    badge: 'SOC Certified',
    duration: '14 Weeks',
    timing: 'Mon–Thu (6pm–9pm) Evening',
    fee: '₹48,000 / $560',
    description: 'Defend enterprise infrastructure with network security, ethical penetration testing, SIEM monitoring, and SOC incident triage.',
    topics: ['Network Defense', 'Penetration Testing', 'SIEM / Splunk', 'Identity Access', 'Incident Response', 'OWASP Top 10'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=700&q=80',
    accentColor: '#dc2626',
    mentor: 'Rajesh V. (CISSP)',
    rating: '4.94 (210 reviews)',
  },
  {
    title: 'UI/UX Design',
    badge: 'Portfolio Ready',
    duration: '10 Weeks',
    timing: 'Fri & Sat (11am–3pm)',
    fee: '₹38,000 / $440',
    description: 'Craft high-converting SaaS interfaces, user journey maps, enterprise design systems, interactive Figma prototypes, and design handoffs.',
    topics: ['UX Research', 'Information Arch', 'Figma Systems', 'Micro-interactions', 'Design Handoff', 'Usability Testing'],
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=700&q=80',
    accentColor: '#ea580c',
    mentor: 'Kavita P. (Staff Designer)',
    rating: '4.96 (195 reviews)',
  },
];

const HIRING_PARTNERS = [
  'Google Cloud', 'Microsoft Azure', 'Amazon Web Services', 'Razorpay', 
  'Cisco Systems', 'Flipkart', 'Infosys Digital', 'TCS Innovate', 'Accenture AI'
];

const ALUMNI_TESTIMONIALS = [
  {
    name: 'Rohan Deshmukh',
    role: 'SDE-1 at Razorpay',
    course: 'Full Stack Web Dev',
    salary: '₹14.5 LPA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    quote: 'The 1-on-1 code reviews and real-time project deployment gave me the exact skills tested in my technical rounds.',
  },
  {
    name: 'Ananya Sengupta',
    role: 'Cloud Architect at Cisco',
    course: 'Cloud & DevOps',
    salary: '₹18.0 LPA',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    quote: 'Transitioned from support to cloud infrastructure engineering within 4 months of graduating from the weekend batch.',
  },
  {
    name: 'Karthik Nair',
    role: 'ML Engineer at Flipkart',
    course: 'Data Science & AI',
    salary: '₹16.8 LPA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    quote: 'Building real LLM agent workflows and deploying them gave my portfolio the edge over thousands of applicants.',
  },
];

const FAQS = [
  {
    q: 'What is the provisional admission & seat locking process?',
    a: 'Admission is based on an initial aptitude review and 1-on-1 counseling consultation. Once you register for provisional admission, our senior technical advisors review your background, evaluate program fit, and issue your official admission offer letter within 24 hours.',
  },
  {
    q: 'Can working professionals attend classes without quitting their current jobs?',
    a: 'Yes! All courses offer Weekend Professional (Saturday & Sunday 11am–3pm) and Evening (Monday–Thursday 6pm–9pm) tracks. All live sessions are recorded in 4K and accessible on demand with lifelong access to teaching materials and repository templates.',
  },
  {
    q: 'How does BrightPath Academy guarantee placement assistance?',
    a: 'We partner with over 45+ premier technology companies including Google Cloud, AWS, Cisco, Razorpay, and Flipkart. Every enrolled student participates in 10+ mock technical interviews, resume code reviews, live project defenses, and receives direct recruiter referrals until placement.',
  },
  {
    q: 'What payment plans and scholarship options are available?',
    a: 'We provide zero-interest EMI options (starting at ₹3,800/month) through our verified financial partners. Early bird applicants locking their intake seat before the deadline receive up to ₹10,000 in tuition scholarships.',
  },
  {
    q: 'What if I need 1-on-1 mentor guidance during assignments?',
    a: 'Our mentorship team holds daily live doubt-clearing rooms from 9am to 10pm IST. You can schedule 1-on-1 pair-programming sessions with staff engineers to unblock your code, review architectures, and get real-world engineering feedback.',
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

  // Interactive ROI Calculator State
  const [currentSalaryLPA, setCurrentSalaryLPA] = useState<number>(3.5);
  const [targetPackageLPA, setTargetPackageLPA] = useState<number>(14.0);

  // Online Application Form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCourse, setFormCourse] = useState('Full Stack Web Dev');
  const [formStudyMode, setFormStudyMode] = useState('Online Live Interactive');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
        // Check if candidate recently registered via the public portal or local storage
        let foundLocal: Lead | null = null;
        try {
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('bp_public_leads');
            const storedAll = localStorage.getItem('bp_crm_all_leads');
            const combined: Lead[] = [
              ...(stored ? JSON.parse(stored) : []),
              ...(storedAll ? JSON.parse(storedAll) : [])
            ];
            foundLocal = combined.find((l) =>
              (l.phone && l.phone.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))) ||
              (l.email && l.email.toLowerCase().includes(clean.toLowerCase()))
            ) || null;
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
            assigned_profile: { id: 'p1', full_name: 'Dr. S. K. Jenkins', role: 'admin', created_at: '', updated_at: '' },
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
            assigned_profile: { id: 'p2', full_name: 'Sarah Jenkins', role: 'counsellor', created_at: '', updated_at: '' },
          } as Lead);
          setSearchError(null);
        } else if (clean.includes('8839020221')) {
          setSearchedLead({
            id: 'lead-1730000000001',
            full_name: 'sanya sharma',
            phone: '8839020221',
            email: 'sanya.s@gmail.com',
            course_interest: 'Data Science & AI',
            status: 'Converted',
            source: 'Website Form',
            notes: 'Provisional seat locked via portal.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assigned_profile: { id: 'p2', full_name: 'Sarah Jenkins', role: 'counsellor', created_at: '', updated_at: '' },
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

  // ROI calculations
  const monthlyCurrent = Math.round((currentSalaryLPA * 100000) / 12);
  const monthlyTarget = Math.round((targetPackageLPA * 100000) / 12);
  const monthlyJump = Math.max(0, monthlyTarget - monthlyCurrent);
  const tuitionCost = 50000;
  const paybackDays = monthlyJump > 0 ? Math.round((tuitionCost / monthlyJump) * 30) : 30;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Floating Glassmorphic Navigation Bar */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '0.85rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AcademyLogo size={38} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.4px' }}>
                  BrightPath<span style={{ color: '#2563eb' }}>Academy</span>
                </span>
                <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Student Portal
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Intake Session 2026–2027 &bull; Bengaluru Central Campus &bull; AICTE / ISO 9001:2015
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
              className="btn btn-spring"
              style={{ fontSize: '0.825rem', color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', fontWeight: 700, padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Track your real-time enrolment status"
            >
              <Search size={14} color="#059669" />
              <span>Track Enrolment</span>
            </button>
            <a 
              href="#roi-calculator" 
              style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', padding: '0.45rem 0.65rem' }}
            >
              Salary Calculator
            </a>
            <a 
              href="#courses-catalog" 
              style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', padding: '0.45rem 0.65rem' }}
            >
              Curricula
            </a>
            <a 
              href="#apply-form" 
              className="btn btn-primary btn-spring"
              style={{ fontSize: '0.825rem', padding: '0.45rem 0.95rem', fontWeight: 700 }}
            >
              Apply Online
            </a>

            {/* Switch back to Staff CRM */}
            <button
              onClick={() => {
                if (onOpenStaffAuth) onOpenStaffAuth();
                onSwitchToStaff();
              }}
              className="btn btn-outline btn-spring"
              style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem', gap: '6px', borderColor: '#cbd5e1' }}
              title="Switch back to Staff & Counsellor CRM Workspace"
            >
              <Lock size={13} color="#64748b" />
              <span>Staff CRM</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Admissions Banner — Human-Designed Luminous Mesh Canvas */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.94) 0%, rgba(15, 23, 42, 0.92) 50%, rgba(30, 58, 138, 0.94) 100%), url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat',
          color: '#ffffff',
          padding: '5rem 1.5rem 6.5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -10px rgba(11, 15, 25, 0.5)',
        }}
      >
        {/* ThreeUI Ambient Glow Orbs */}
        <div className="glow-orb glow-orb-blue" style={{ width: 450, height: 450, top: -100, left: -100 }} />
        <div className="glow-orb glow-orb-purple" style={{ width: 500, height: 500, bottom: -150, right: -100 }} />
        <div className="glow-orb glow-orb-cyan" style={{ width: 350, height: 350, top: '20%', right: '15%' }} />

        <div style={{ maxWidth: '1120px', margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
          
          {/* Animated Floating Intake Badge */}
          <div 
            className="animate-float"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(255, 255, 255, 0.12)', 
              backdropFilter: 'blur(12px)', 
              WebkitBackdropFilter: 'blur(12px)', 
              padding: '0.45rem 1.15rem', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.825rem', 
              fontWeight: 800, 
              marginBottom: '1.5rem', 
              border: '1px solid rgba(255, 255, 255, 0.25)', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)' 
            }}
          >
            <Sparkles size={16} color="#38bdf8" />
            <span style={{ color: '#f8fafc' }}>
              Next Intake Batch: <strong style={{ color: '#67e8f9' }}>16 November 2026</strong> &bull; Limited Campus &amp; Virtual Seats
            </span>
          </div>

          <h1 
            className="font-display gradient-text-hero"
            style={{ 
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', 
              fontWeight: 900, 
              lineHeight: 1.12, 
              margin: '0 0 1.25rem 0', 
              letterSpacing: '-0.035em' 
            }}
          >
            Launch Your High-Growth Career in Software &amp; AI
          </h1>
          
          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', maxWidth: '720px', margin: '0 auto 2.25rem auto', lineHeight: 1.6, fontWeight: 400 }}>
            Intensive technology bootcamps in Full Stack, Cloud DevOps, AI &amp; Data Science, and Cybersecurity. Taught by principal engineers with 1-on-1 industry mentorship and guaranteed placement assistance.
          </p>

          {/* Real-Time Live Activity Notification Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', padding: '0.35rem 0.95rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 600, marginBottom: '2.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} className="animate-pulse-glow" />
            <span>5 prospective students registered for provisional admission in the last 2 hours</span>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <a 
              href="#apply-form" 
              className="btn btn-spring" 
              style={{ 
                background: '#ffffff', 
                color: '#0f172a', 
                fontWeight: 800, 
                padding: '0.95rem 2rem', 
                fontSize: '1rem', 
                boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <Send size={17} color="#2563eb" />
              <span>Register for Free Consultation</span>
            </a>

            <button 
              type="button"
              onClick={() => {
                const el = document.getElementById('status-checker');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                const targetPhone = lookupQuery.trim() || '9876543210';
                setLookupQuery(targetPhone);
                performLookup(targetPhone);
              }}
              className="btn btn-spring animate-pulse-glow" 
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: '#ffffff', 
                border: '1px solid #34d399',
                padding: '0.95rem 2rem', 
                fontSize: '1rem',
                fontWeight: 800,
                boxShadow: '0 12px 30px rgba(16, 185, 129, 0.4)',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
              title="Click to check live admission status (Auto-populates verified student profile)"
            >
              <Search size={17} />
              <span>Check My Admission Status (Instant Verify) &rarr;</span>
            </button>
          </div>

          {/* Social Proof Strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '3rem', fontSize: '0.9rem', color: '#94a3b8', flexWrap: 'wrap', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#34d399" />
              <span style={{ color: '#f1f5f9' }}>AICTE &amp; ISO 9001:2015 Approved</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} fill="#f59e0b" color="#f59e0b" />
              <span style={{ color: '#f1f5f9' }}>4.95/5 Rating (2,400+ Alumni)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} color="#38bdf8" />
              <span style={{ color: '#f1f5f9' }}>₹14.2 LPA Avg. Starting CTC</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter Placement Marquee Ribbon (TasteSkill Style) */}
      <section style={{ background: '#0b0f19', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ paddingLeft: '2rem', flexShrink: 0, color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Top Hiring Partners:
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div className="marquee-track" style={{ gap: '3rem', alignItems: 'center' }}>
              {[...HIRING_PARTNERS, ...HIRING_PARTNERS].map((partner, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 700 }}>
                  <Building2 size={16} color="#60a5fa" />
                  <span>{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Viewport */}
      <main style={{ maxWidth: '1240px', margin: '-2.5rem auto 4rem auto', padding: '0 1.25rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', zIndex: 10 }}>

        {/* Section 1: Real-Time Application Status Verifier */}
        <section 
          id="status-checker" 
          className="glass-card-premium" 
          style={{ 
            padding: '2.5rem', 
            borderRadius: '20px', 
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.1)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            background: '#ffffff'
          }}
        >
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 50, height: 50, borderRadius: '14px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.15)' }}>
              <Search size={26} />
            </div>
            
            <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.4rem', letterSpacing: '-0.4px' }}>
              Check Your Admission &amp; Enrolment Status
            </h2>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Enter the phone number or email registered with your application to check your real-time enrolment stage, interview outcome, and download your admission slip.
            </p>

            <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter phone number (e.g. 9876543210) or email..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '260px',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: '#f8fafc',
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="btn btn-primary btn-spring"
                style={{ padding: '0.85rem 1.75rem', fontWeight: 800, gap: '8px', fontSize: '0.95rem' }}
              >
                {isSearching ? <Clock size={16} className="spin" /> : <Search size={16} />}
                <span>Verify Status</span>
              </button>
            </form>

            {/* Quick Demo Candidate Lookup Chips */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>⚡ Try Demo Records:</span>
              <button
                type="button"
                onClick={() => {
                  setLookupQuery('9876543210');
                  performLookup('9876543210');
                }}
                className="btn btn-outline btn-spring"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.785rem', borderColor: '#86efac', background: '#f0fdf4', color: '#16a34a', gap: '6px' }}
                title="Verify Converted Student (Arjun Patel) with Official PDF Admission Slip"
              >
                <span>9876543210</span>
                <span style={{ fontWeight: 800 }}>🎉 Confirmed (PDF Slip)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookupQuery('9123456789');
                  performLookup('9123456789');
                }}
                className="btn btn-outline btn-spring"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.785rem', borderColor: '#bfdbfe', background: '#eff6ff', color: '#2563eb', gap: '6px' }}
                title="Verify Qualified Candidate (Priya Sharma)"
              >
                <span>9123456789</span>
                <span style={{ fontWeight: 800 }}>⚡ Qualified Review</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookupQuery('8839020221');
                  performLookup('8839020221');
                }}
                className="btn btn-outline btn-spring"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.785rem', borderColor: '#fed7aa', background: '#fff7ed', color: '#ea580c', gap: '6px' }}
                title="Verify Candidate (Sanya Sharma)"
              >
                <span>8839020221</span>
                <span style={{ fontWeight: 800 }}>📄 Provisional Seat</span>
              </button>
            </div>

            {searchError && (
              <div style={{ padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.65rem', textAlign: 'left' }}>
                <AlertCircle size={20} />
                <span>{searchError}</span>
              </div>
            )}

            {/* Found Record Card with Celebratory Styling */}
            {hasSearched && searchedLead && (
              <div 
                className="fade-in-slide"
                style={{
                  marginTop: '1.75rem',
                  padding: '1.85rem',
                  borderRadius: '16px',
                  background: searchedLead.status === 'Converted' ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' : '#f8fafc',
                  border: searchedLead.status === 'Converted' ? '1.5px solid #86efac' : '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  boxShadow: searchedLead.status === 'Converted' ? '0 12px 30px rgba(16, 185, 129, 0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.4px' }}>
                      Enrolled Applicant
                    </span>
                    <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
                      {searchedLead.full_name}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      padding: '0.4rem 0.95rem',
                      borderRadius: 'var(--radius-full)',
                      background: searchedLead.status === 'Converted' ? '#dcfce7' : '#eff6ff',
                      color: searchedLead.status === 'Converted' ? '#15803d' : '#1d4ed8',
                      border: searchedLead.status === 'Converted' ? '1px solid #86efac' : '1px solid #bfdbfe',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {searchedLead.status === 'Converted' ? '🎉 ENROLMENT CONFIRMED' : `Status: ${searchedLead.status}`}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Course Track:</span>
                    <div style={{ marginTop: '4px' }}>
                      <CourseBadge courseName={searchedLead.course_interest} size="md" />
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Application Date:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                      {new Date(searchedLead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Admissions Advisor:</span>
                    <div style={{ fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                      {searchedLead.assigned_profile?.full_name || 'Senior Admissions Registrar'}
                    </div>
                  </div>
                </div>

                {/* 4-Step Visual Progress Stepper */}
                <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.4px' }}>
                    Admission Milestones &amp; Verification Progress:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { step: 1, label: 'Enquiry Received', done: true },
                      { step: 2, label: 'Counsellor Review', done: searchedLead.status !== 'New' },
                      { step: 3, label: 'Batch Eligibility', done: searchedLead.status === 'Qualified' || searchedLead.status === 'Converted' },
                      { step: 4, label: 'Confirmed Enrolment', done: searchedLead.status === 'Converted' },
                    ].map((m) => (
                      <div
                        key={m.step}
                        style={{
                          padding: '0.75rem 0.65rem',
                          borderRadius: '8px',
                          background: m.done ? '#ecfdf5' : '#f8fafc',
                          border: m.done ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: m.done ? '#059669' : '#94a3b8' }}>
                          {m.done ? '✓ Step ' + m.step : '○ Step ' + m.step}
                        </div>
                        <div style={{ fontSize: '0.785rem', fontWeight: 700, color: m.done ? '#065f46' : 'var(--text-secondary)', marginTop: '3px' }}>
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Batch & Enrolment Information Details */}
                <div style={{ padding: '1rem 1.25rem', background: '#ffffff', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Student Roll Ref: </span>
                      <strong style={{ fontFamily: 'monospace', color: '#1d4ed8' }}>BP-2026-{searchedLead.id.substring(0, 6).toUpperCase()}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Next Batch Intake: </span>
                      <strong>16th November 2026</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Delivery Mode: </span>
                      <strong>Bengaluru Campus &amp; LMS Portal</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: WhatsApp Support & Printable Slip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: searchedLead.status === 'Converted' ? '1px solid #bbf7d0' : '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(`Hello! I am ${searchedLead.full_name}. I am checking my admission application for ${searchedLead.course_interest} at BrightPath Academy.`);
                      window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
                    }}
                    className="btn btn-outline btn-spring"
                    style={{ fontSize: '0.85rem', padding: '0.55rem 1rem', gap: '6px', borderColor: '#86efac', color: '#15803d', background: '#f0fdf4', fontWeight: 700 }}
                    title="Direct WhatsApp chat with Admissions Counselor"
                  >
                    <MessageCircle size={15} color="#16a34a" />
                    <span>WhatsApp Admissions Advisor</span>
                  </button>

                  {searchedLead.status === 'Converted' && (
                    <button
                      onClick={() => setIsLetterModalOpen(true)}
                      className="btn btn-primary btn-spring animate-pulse-glow"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#15803d', gap: '8px', padding: '0.65rem 1.25rem', fontWeight: 800 }}
                    >
                      <Printer size={16} />
                      <span>Download Official Admission Slip (PDF)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Interactive Tuition ROI & Salary Jump Calculator */}
        <section 
          id="roi-calculator" 
          className="card"
          style={{ 
            padding: '2.5rem', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            border: '1.5px solid #a7f3d0',
            boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.1)',
          }}
        >
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <Calculator size={14} /> Career Return on Investment
              </div>
              <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.4px' }}>
                Calculate Your Tech Career Salary Jump
              </h2>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                See how quickly a 12 to 16-week BrightPath bootcamp pays for itself in real monthly earnings.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              
              {/* Sliders Input */}
              <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Current CTC / College Status:
                    </label>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#475569', fontFamily: 'monospace' }}>
                      {currentSalaryLPA === 0 ? 'Fresh Graduate (₹0)' : `₹${currentSalaryLPA.toFixed(1)} LPA`}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={10} 
                    step={0.5}
                    value={currentSalaryLPA}
                    onChange={(e) => setCurrentSalaryLPA(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Fresh Graduate</span>
                    <span>₹5.0 LPA</span>
                    <span>₹10.0 LPA</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Target Tech Track Package:
                    </label>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669', fontFamily: 'monospace' }}>
                      ₹{targetPackageLPA.toFixed(1)} LPA
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min={8} 
                    max={28} 
                    step={1}
                    value={targetPackageLPA}
                    onChange={(e) => setTargetPackageLPA(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>₹8.0 LPA (Min)</span>
                    <span>₹14.2 LPA (Avg)</span>
                    <span>₹28.0 LPA (Top)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic ROI Telemetry Card */}
              <div style={{ background: '#0f172a', color: '#ffffff', padding: '2rem', borderRadius: '18px', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)' }}>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                  ★ PROJECTED FINANCIAL RETURN
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target Monthly Pay:</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                      ₹{monthlyTarget.toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/mo</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Monthly Salary Jump:</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>
                      +₹{monthlyJump.toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/mo</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>Tuition Payback Period:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fde047' }}>
                    ~{paybackDays} Days
                  </span>
                </div>

                <a 
                  href="#apply-form" 
                  className="btn btn-spring" 
                  style={{ width: '100%', justifyContent: 'center', background: '#2563eb', color: '#ffffff', padding: '0.75rem', fontWeight: 800, fontSize: '0.9rem', gap: '6px' }}
                >
                  <span>Apply to Unlock This Package &rarr;</span>
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* Section 3: Explore Courses Catalog (Bento Grid) */}
        <section id="courses-catalog">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase' }}>
              Curated Technical Bootcamps
            </span>
            <h2 className="font-display" style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.4px', marginTop: '0.5rem' }}>
              Featured Technology Curricula
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '620px', margin: '4px auto 0 auto' }}>
              Comprehensive 10 to 16-week live programs designed to build portfolio-grade projects and crack product company interviews.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
            {COURSES_DATA.map((course) => (
              <div 
                key={course.title}
                className="card-interactive-3d"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '18px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                }}
              >
                {/* Course Cover Image Banner with Vignette Overlay */}
                <div style={{ position: 'relative', width: '100%', height: '175px', overflow: 'hidden' }}>
                  <img
                    src={course.image}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=700&q=80';
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.90) 0%, rgba(15, 23, 42, 0.25) 60%, rgba(0,0,0,0) 100%)' }} />
                  
                  {/* Top Badges: Category Tag & Fee */}
                  <div style={{ position: 'absolute', top: '12px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', backdropFilter: 'blur(6px)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.25)' }}>
                      {course.badge}
                    </span>
                    <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#059669', background: '#ffffff', padding: '0.25rem 0.7rem', borderRadius: 'var(--radius-sm)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                      {course.fee}
                    </span>
                  </div>

                  {/* Bottom Image Overlay: Course Badge */}
                  <div style={{ position: 'absolute', bottom: '12px', left: '14px' }}>
                    <CourseBadge courseName={course.title} size="md" />
                  </div>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                      {course.description}
                    </p>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#f8fafc', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                        ⏱️ {course.duration}
                      </span>
                      <span style={{ background: '#f8fafc', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                        📅 {course.timing}
                      </span>
                    </div>

                    {/* Mentor & Rating Strip */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '1.25rem', fontSize: '0.785rem' }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Lead Mentor: <strong>{course.mentor}</strong></span>
                      <span style={{ color: '#d97706', fontWeight: 700 }}>⭐ {course.rating}</span>
                    </div>

                    {/* Curriculum highlights */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.4px' }}>
                        Core Syllabus &amp; Tech Stack:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {course.topics.map((t) => (
                          <span key={t} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0', padding: '0.2rem 0.55rem', borderRadius: '5px', fontWeight: 600 }}>
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
                    className="btn btn-outline btn-spring"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, gap: '6px', borderColor: '#2563eb', color: '#1d4ed8', background: '#eff6ff', padding: '0.65rem 1rem' }}
                  >
                    <span>Apply for this Program</span>
                    <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Alumni Testimonials & Placements (TasteSkill Quality) */}
        <section style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase' }}>
              Real Student Outcomes
            </span>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.4rem', letterSpacing: '-0.3px' }}>
              Where Our Graduates Work
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              From non-tech backgrounds to top tier software engineering teams.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {ALUMNI_TESTIMONIALS.map((t, i) => (
              <div 
                key={i}
                className="card-interactive-3d"
                style={{ padding: '1.5rem', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{t.name}</h4>
                    <div style={{ fontSize: '0.785rem', color: '#2563eb', fontWeight: 700 }}>{t.role}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {t.salary}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Alumni: {t.course}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Online Admission Application Form */}
        <section id="apply-form" className="card" style={{ padding: '3rem 2rem', borderRadius: '20px', background: '#ffffff', border: '1.5px solid rgba(37, 99, 235, 0.25)', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <AcademyLogo size={46} />
              </div>
              <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.2rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Official Academy Application &bull; Intake 2026–2027
              </span>
              <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.5rem', letterSpacing: '-0.3px' }}>
                Register for Provisional Admission
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Fill out the brief consultation form. Our senior admissions team will schedule your 1-on-1 counseling session and evaluate fee scholarship eligibility.
              </p>
            </div>

            {submitSuccess ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', background: '#ecfdf5', borderRadius: '16px', border: '1.5px solid #86efac' }}>
                <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />
                <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', marginBottom: '0.5rem' }}>
                  Application Received Successfully!
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#14532d', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                  Thank you, <strong>{formName}</strong>. Your profile has been queued for evaluation. You can verify your live status above anytime using your phone number: <strong>{formPhone}</strong>.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const submittedPhone = formPhone;
                      setLookupQuery(submittedPhone);
                      performLookup(submittedPhone);
                      const el = document.getElementById('status-checker');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-primary btn-spring"
                    style={{ fontSize: '0.9rem', gap: '6px', padding: '0.65rem 1.25rem' }}
                  >
                    <Search size={15} />
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
                    className="btn btn-outline btn-spring"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sanya Sharma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Contact Phone (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. sanya.s@gmail.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Select Desired Course Program *
                    </label>
                    <select
                      value={formCourse}
                      onChange={(e) => setFormCourse(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', background: '#ffffff', outline: 'none' }}
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
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Preferred Learning Format
                  </label>
                  <select
                    value={formStudyMode}
                    onChange={(e) => setFormStudyMode(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', background: '#ffffff', outline: 'none' }}
                  >
                    <option value="Online Live Interactive">Online Live Interactive (Virtual Classroom)</option>
                    <option value="Classroom Bootcamp">Classroom Intensive Bootcamp (Bengaluru Campus)</option>
                    <option value="Weekend Professional">Weekend Professional Batch (Working Professionals)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Questions / Career Aspirations
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your background, career goals, or any specific questions regarding syllabus, placement assistance, scholarships, etc."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-spring"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1rem', fontWeight: 800, gap: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)' }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application & Lock Intake Seat'}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Section 6: Interactive Admissions FAQ Accordion */}
        <section style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase' }}>
              Admissions FAQ
            </span>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.4rem', letterSpacing: '-0.3px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Everything you need to know about enrolment, batch timings, scholarships, and career assistance.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bento-card-surface fade-in-slide"
                  style={{
                    borderRadius: '12px',
                    border: isOpen ? '1.5px solid #2563eb' : '1px solid var(--border-subtle)',
                    boxShadow: isOpen ? '0 8px 24px rgba(37, 99, 235, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    style={{
                      width: '100%',
                      padding: '1.15rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      background: isOpen ? '#f8fafc' : 'transparent',
                      cursor: 'pointer',
                      border: 'none',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <HelpCircle size={18} color={isOpen ? '#2563eb' : '#64748b'} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isOpen ? '#1d4ed8' : 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      color={isOpen ? '#2563eb' : '#94a3b8'}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        flexShrink: 0,
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.25rem 1.15rem 1.25rem',
                        fontSize: '0.875rem',
                        color: '#475569',
                        lineHeight: 1.6,
                        borderTop: '1px solid #f1f5f9',
                        background: '#ffffff',
                      }}
                    >
                      <p style={{ margin: '0.75rem 0 0 0' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer style={{ background: '#0b0f19', color: '#94a3b8', padding: '2.5rem 1.5rem', marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AcademyLogo size={28} />
            <span style={{ color: '#ffffff', fontWeight: 800, fontFamily: 'var(--font-display)' }}>BrightPath Academy</span>
            <span>&bull; Registered Institute for Advanced Software &amp; Data Sciences &copy; 2026</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span>Admissions Helpline: <strong style={{ color: '#ffffff' }}>+91 (80) 4567-8900</strong></span>
            <span>Email: <strong style={{ color: '#ffffff' }}>admissions@brightpath.edu</strong></span>
            <button
              onClick={onSwitchToStaff}
              style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', fontWeight: 600 }}
            >
              Staff CRM Portal
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
