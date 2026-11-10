import React from 'react';
import { Menu, Bell, LogIn, Globe, GraduationCap, ChevronDown, LogOut, Search } from 'lucide-react';
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
  onSwitchToStudentPortal?: () => void;
  onOpenCommandPalette?: () => void;
  isAuthenticated?: boolean;
  userRole?: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileDrawer,
  onQuickAction: _onQuickAction,
  onOpenAssistant,
  onOpenAuthModal,
  onSignOut,
  onOpenSimulator,
  onSwitchToStudentPortal,
  onOpenCommandPalette,
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
        {/* Command Palette Trigger Button */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="btn-micro-spring"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: '#64748b',
              cursor: 'pointer',
            }}
            title="Open Command Palette (Press ⌘K or Ctrl+K anywhere)"
          >
            <Search size={14} color="#94a3b8" />
            <span style={{ marginRight: '2px', fontWeight: 500 }}>Search or Jump to...</span>
            <kbd 
              style={{ 
                fontSize: '0.68rem', 
                fontFamily: 'var(--font-mono, monospace)', 
                padding: '1px 5px', 
                background: '#e2e8f0', 
                borderRadius: '4px', 
                border: '1px solid #cbd5e1',
                color: '#475569'
              }}
            >
              ⌘K
            </kbd>
          </button>
        )}

        {/* Database Status Pill */}
        <DatabaseStatusBadge onOpenAssistant={onOpenAssistant} />

        {onSwitchToStudentPortal && (
          <button
            onClick={onSwitchToStudentPortal}
            className="btn btn-outline"
            style={{ 
              padding: '0.4rem 0.75rem', 
              fontSize: '0.8rem', 
              gap: '6px', 
              borderColor: '#93c5fd', 
              color: '#1d4ed8',
              background: '#eff6ff',
            }}
            title="Open Public Student & Admissions Portal (Browse courses, apply online, track status)"
          >
            <GraduationCap size={14} color="#2563eb" />
            <span>Student Portal</span>
          </button>
        )}

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
            {/* Notifications Button */}
            <button className="btn-icon btn-micro-spring" title="Notifications & Activity" aria-label="Notifications" style={{ position: 'relative' }}>
              <Bell size={18} />
              <span 
                style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '8px', 
                  width: '7px', 
                  height: '7px', 
                  borderRadius: '50%', 
                  background: '#2563eb',
                  border: '1.5px solid #ffffff'
                }} 
              />
            </button>

            {/* Consolidated User Profile & Role Menu Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <button 
                type="button"
                onClick={onOpenAuthModal}
                className="btn-micro-spring"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.85rem 0.35rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#ffffff',
                  border: `1.5px solid ${roleTheme.border}`,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
                title={`Active Session: ${userName} (${userRole}). Click to switch role or manage account.`}
              >
                <UserAvatar name={userName} size={28} showStatus={true} status="online" />
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                    {userName}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: roleTheme.text, fontWeight: 700, textTransform: 'capitalize' }}>
                    {userRole}
                  </div>
                </div>
                <ChevronDown size={14} color="#64748b" style={{ marginLeft: '2px' }} />
              </button>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="btn-icon btn-micro-spring"
                  style={{ width: 34, height: 34, color: '#64748b', background: '#f8fafc', border: '1px solid var(--border-subtle)' }}
                  title="Sign Out of Active Session"
                  aria-label="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              )}
            </div>
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

