import React from 'react';
import { Menu, Plus, Bell, LogIn, LogOut, Globe } from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { DatabaseStatusBadge } from '../common/DatabaseStatusBadge';
import { UserAvatar } from '../common/UserAvatar';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenMobileDrawer: () => void;
  onQuickAction?: () => void;
  onOpenAssistant?: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  onOpenSimulator?: () => void;
  isAuthenticated?: boolean;
  userRole?: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileDrawer,
  onQuickAction,
  onOpenAssistant,
  onOpenAuthModal,
  onSignOut,
  onOpenSimulator,
  isAuthenticated = false,
  userRole = 'Counsellor',
  userName = 'Sarah Jenkins',
}) => {
  const getTabTitles = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Admissions Overview',
          subtitle: 'Live academy conversion metrics, overdue reminders, and pipeline KPIs',
        };
      case 'leads':
        return {
          title: 'Student Leads Pipeline',
          subtitle: 'Track walk-ins, calls, web forms, and counsellor interactions',
        };
      case 'followups':
        return {
          title: 'Scheduled Follow-ups',
          subtitle: 'Manage upcoming tasks, student reminders, and overdue actions',
        };
      case 'settings':
        return {
          title: 'Institute & Account Settings',
          subtitle: 'Profile preferences, team management, and role policies',
        };
    }
  };

  const { title, subtitle } = getTabTitles(currentTab);

  const getRoleColors = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return { bg: 'rgba(124, 58, 237, 0.08)', border: 'rgba(124, 58, 237, 0.3)', text: '#7c3aed' };
      case 'manager':
        return { bg: 'rgba(79, 70, 229, 0.08)', border: 'rgba(79, 70, 229, 0.3)', text: '#4f46e5' };
      default:
        return { bg: 'rgba(37, 99, 235, 0.08)', border: 'rgba(37, 99, 235, 0.25)', text: '#2563eb' };
    }
  };

  const roleTheme = getRoleColors(userRole);

  return (
    <header className="top-header" role="banner">
      <div className="header-left">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileDrawer}
          className="btn-icon mobile-only"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-box">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Database Status Pill */}
        <DatabaseStatusBadge onOpenAssistant={onOpenAssistant} />

        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="btn btn-outline"
            style={{ 
              padding: '0.4rem 0.75rem', 
              fontSize: '0.8rem', 
              gap: '6px', 
              borderColor: '#c4b5fd', 
              color: '#6d28d9',
              background: '#f5f3ff',
            }}
            title="Open Website Enquiry Form Simulator (Simulates student leads ingestion)"
          >
            <Globe size={14} color="#7c3aed" />
            <span>Web Simulator</span>
          </button>
        )}

        {isAuthenticated ? (
          <>
            {/* Dynamic Role Badge with Avatar */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: roleTheme.bg,
                border: `1px solid ${roleTheme.border}`,
                fontSize: '0.8rem',
                fontWeight: 600,
                color: roleTheme.text,
              }}
              title={`Logged in as ${userName} (${userRole})`}
            >
              <UserAvatar name={userName} size={24} />
              <span>{userRole}: {userName.split(' ')[0]}</span>
            </div>

            {/* Notifications */}
            <button className="btn-icon" title="Notifications" aria-label="Notifications">
              <Bell size={18} />
            </button>

            {/* Primary Action Button */}
            {onQuickAction && (
              <button onClick={onQuickAction} className="btn btn-primary">
                <Plus size={16} />
                <span>New Lead</span>
              </button>
            )}

            {/* Sign Out Button */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', gap: '4px' }}
                title="Sign out of your account"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', gap: '6px' }}
          >
            <LogIn size={16} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
};

