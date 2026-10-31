import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { NavigationTab } from './components/layout/Sidebar';
import { DashboardView } from './features/dashboard/DashboardView';
import { LeadsView } from './features/leads/LeadsView';
import { FollowUpsView } from './features/followups/FollowUpsView';
import { SettingsView } from './features/settings/SettingsView';
import { ConnectionAssistant } from './components/common/ConnectionAssistant';
import { AuthModal } from './components/auth/AuthModal';
import { LeadFormModal } from './features/leads/LeadFormModal';
import { ScheduleFollowUpModal } from './features/followups/ScheduleFollowUpModal';
import { Lead, LeadStatus } from './types/database';
import { followUpService } from './services/followUpService';
import { Lock, LogIn } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('leads');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [targetLeadFilterQuery, setTargetLeadFilterQuery] = useState<string | undefined>(undefined);
  const [targetStatusFilter, setTargetStatusFilter] = useState<string | undefined>(undefined);
  const [targetSourceFilter, setTargetSourceFilter] = useState<string | undefined>(undefined);
  const [scheduleModalLeadId, setScheduleModalLeadId] = useState<string | undefined>(undefined);
  const [isAppScheduleModalOpen, setIsAppScheduleModalOpen] = useState(false);

  const { user, profile, role, isAuthenticated, signOut } = useAuth();

  const handleOpenCreateLead = () => {
    setLeadToEdit(null);
    setIsNewLeadModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsNewLeadModalOpen(true);
  };

  const handleScheduleForLead = (lead: Lead) => {
    setScheduleModalLeadId(lead.id);
    setIsAppScheduleModalOpen(true);
  };

  const handleViewLeadFromFollowUp = (_leadId: string, leadName: string) => {
    setTargetLeadFilterQuery(leadName);
    setTargetStatusFilter('all');
    setTargetSourceFilter('all');
    setCurrentTab('leads');
  };

  const handleNavigateToLeadsWithStatus = (status: LeadStatus) => {
    setTargetLeadFilterQuery(undefined);
    setTargetSourceFilter('all');
    setTargetStatusFilter(status);
    setCurrentTab('leads');
  };

  const handleNavigateToLeadsWithSource = (source: string) => {
    setTargetLeadFilterQuery(undefined);
    setTargetStatusFilter('all');
    setTargetSourceFilter(source);
    setCurrentTab('leads');
  };

  const handleLeadSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Sync overdue tasks count across the app shell
  useEffect(() => {
    followUpService.getOverdueCount().then(setOverdueCount);
  }, [refreshTrigger, currentTab]);

  const displayName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Guest Counsellor');
  const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Counsellor';

  return (
    <Layout
      currentTab={currentTab}
      onSelectTab={(tab) => {
        if (tab !== 'leads') {
          setTargetLeadFilterQuery(undefined);
          setTargetStatusFilter(undefined);
          setTargetSourceFilter(undefined);
        }
        setCurrentTab(tab);
      }}
      onQuickAction={handleOpenCreateLead}
      onOpenAssistant={() => setIsAssistantOpen(true)}
      onOpenAuthModal={() => setIsAuthModalOpen(true)}
      onSignOut={signOut}
      isAuthenticated={isAuthenticated}
      userRole={formattedRole}
      userName={displayName}
      overdueCount={overdueCount}
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
              <strong>Phase 5 Live Database Mode:</strong> Sign in with your staff credentials to access and record student enquiries in your private pipeline.
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
          onNavigateToLeads={() => {
            setTargetLeadFilterQuery(undefined);
            setTargetStatusFilter('all');
            setTargetSourceFilter('all');
            setCurrentTab('leads');
          }}
          onNavigateToFollowUps={() => setCurrentTab('followups')}
          onNavigateToLeadsWithStatus={handleNavigateToLeadsWithStatus}
          onNavigateToLeadsWithSource={handleNavigateToLeadsWithSource}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenCreateLead={handleOpenCreateLead}
          onEditLead={handleEditLead}
          onScheduleFollowUpForLead={handleScheduleForLead}
        />
      )}

      {currentTab === 'leads' && (
        <LeadsView 
          onOpenCreateModal={handleOpenCreateLead}
          onEditLead={handleEditLead}
          onScheduleFollowUpForLead={handleScheduleForLead}
          initialSearchQuery={targetLeadFilterQuery}
          initialStatusFilter={targetStatusFilter}
          initialSourceFilter={targetSourceFilter}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentTab === 'followups' && (
        <FollowUpsView 
          onScheduleCountChange={setOverdueCount} 
          onViewLead={handleViewLeadFromFollowUp}
        />
      )}

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

      {/* Live Lead Create & Edit Modal */}
      <LeadFormModal
        isOpen={isNewLeadModalOpen}
        onClose={() => {
          setIsNewLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        leadToEdit={leadToEdit}
        onLeadSaved={handleLeadSaved}
      />

      {/* Quick Schedule Follow-up Modal for specific lead */}
      <ScheduleFollowUpModal
        isOpen={isAppScheduleModalOpen}
        onClose={() => {
          setIsAppScheduleModalOpen(false);
          setScheduleModalLeadId(undefined);
        }}
        initialLeadId={scheduleModalLeadId}
        onScheduled={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
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
