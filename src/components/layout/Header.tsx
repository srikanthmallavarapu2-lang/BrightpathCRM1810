import React from 'react';
import { Menu, Plus, Bell, Shield } from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { DatabaseStatusBadge } from '../common/DatabaseStatusBadge';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenMobileDrawer: () => void;
  onQuickAction?: () => void;
  onOpenAssistant?: () => void;
  userRole?: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileDrawer,
  onQuickAction,
  onOpenAssistant,
  userRole = 'Counsellor',
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

        {/* Role Badge */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--primary-600)',
          }}
        >
          <Shield size={14} />
          <span>Role: {userRole}</span>
        </div>

        {/* Quick notification indicator */}
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
      </div>
    </header>
  );
};
