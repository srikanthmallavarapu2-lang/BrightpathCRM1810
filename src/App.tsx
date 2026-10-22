import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { NavigationTab } from './components/layout/Sidebar';
import { DashboardView } from './features/dashboard/DashboardView';
import { LeadsView } from './features/leads/LeadsView';
import { FollowUpsView } from './features/followups/FollowUpsView';
import { SettingsView } from './features/settings/SettingsView';
import { ConnectionAssistant } from './components/common/ConnectionAssistant';
import { AuthModal } from './components/auth/AuthModal';
import { X, Check, Lock, LogIn } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { user, profile, role, isAuthenticated, signOut } = useAuth();

  // Simple state for quick-add lead demonstration
  const [leadForm, setLeadForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    courseInterest: 'Full Stack Web Dev',
    source: 'Website Form',
  });

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Lead "${leadForm.fullName}" form validated! In Phase 5, this will insert directly into public.leads.`);
    setIsNewLeadModalOpen(false);
    setLeadForm({
      fullName: '',
      phone: '',
      email: '',
      courseInterest: 'Full Stack Web Dev',
      source: 'Website Form',
    });
  };

  const displayName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Guest Counsellor');
  const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Counsellor';

  return (
    <Layout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onQuickAction={() => setIsNewLeadModalOpen(true)}
      onOpenAssistant={() => setIsAssistantOpen(true)}
      onOpenAuthModal={() => setIsAuthModalOpen(true)}
      onSignOut={signOut}
      isAuthenticated={isAuthenticated}
      userRole={formattedRole}
      userName={displayName}
    >
      {/* Guest Mode Banner when not logged in */}
      {!isAuthenticated && (
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(79, 70, 229, 0.04))',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Lock size={18} color="#2563eb" />
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Phase 4 Auth Active (Guest Preview Mode).</strong> Sign in or create an account to access live RLS-protected database records.
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', gap: '5px' }}
          >
            <LogIn size={14} />
            <span>Sign In / Create Account</span>
          </button>
        </div>
      )}

      {currentTab === 'dashboard' && (
        <DashboardView
          onNavigateToLeads={() => setCurrentTab('leads')}
          onNavigateToFollowUps={() => setCurrentTab('followups')}
          onOpenAssistant={() => setIsAssistantOpen(true)}
        />
      )}

      {currentTab === 'leads' && (
        <LeadsView onOpenCreateModal={() => setIsNewLeadModalOpen(true)} />
      )}

      {currentTab === 'followups' && <FollowUpsView />}

      {currentTab === 'settings' && (
        <SettingsView onOpenAssistant={() => setIsAssistantOpen(true)} />
      )}

      {/* Supabase Connection Assistant Modal */}
      <ConnectionAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Interactive Quick Modal Demo */}
      {isNewLeadModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setIsNewLeadModalOpen(false)}
        >
          <div 
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              boxShadow: 'var(--shadow-xl)',
              animation: 'modalSlideIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 id="modal-title" style={{ fontSize: '1.15rem', fontWeight: 700 }}>Record Student Enquiry</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter student details to add to admissions pipeline</p>
              </div>
              <button 
                onClick={() => setIsNewLeadModalOpen(false)}
                className="btn-icon"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={leadForm.fullName}
                  onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Course Interest *
                  </label>
                  <select
                    value={leadForm.courseInterest}
                    onChange={(e) => setLeadForm({ ...leadForm, courseInterest: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem', background: 'white' }}
                  >
                    <option value="Full Stack Web Dev">Full Stack Web Dev</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                    <option value="Cybersecurity Fundamentals">Cybersecurity Fundamentals</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Enquiry Source *
                  </label>
                  <select
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem', background: 'white' }}
                  >
                    <option value="Website Form">Website Form</option>
                    <option value="Walk-in Visit">Walk-in Visit</option>
                    <option value="Inbound Phone Call">Inbound Phone Call</option>
                    <option value="Student Referral">Student Referral</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Save Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
