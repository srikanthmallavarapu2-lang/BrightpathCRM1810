import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AcademyLogo } from '../common/AcademyLogo';

export type NavigationTab = 'dashboard' | 'leads' | 'followups' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: string;
  userName?: string;
  overdueCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  userRole = 'Counsellor',
  userName = 'Demo Counsellor',
  overdueCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads' as NavigationTab, label: 'Leads Pipeline', icon: Users },
    { 
      id: 'followups' as NavigationTab, 
      label: 'Follow-ups', 
      icon: Clock, 
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : undefined 
    },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className={`desktop-sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <AcademyLogo size={32} />
          {!isCollapsed && (
            <div>
              <span className="brand-title">BrightPath</span>
              <span className="brand-badge">CRM</span>
            </div>
          )}
        </div>
        <button 
          onClick={onToggleCollapse}
          className="btn-icon" 
          style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="nav-badge-pill">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Role Footer */}
      <div className="sidebar-footer">
        <div className="user-profile-widget" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <div className="user-avatar-initials" title={userName}>
              {getInitials(userName)}
            </div>
            <span 
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #0b0f19',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.8)',
              }} 
              title="Online Session Active"
            />
          </div>
          {!isCollapsed && (
            <div className="user-meta">
              <p className="user-name" style={{ fontWeight: 700, letterSpacing: '-0.2px' }}>{userName}</p>
              <span 
                className="user-role-tag" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  color: userRole.toLowerCase().includes('admin') ? '#c084fc' : userRole.toLowerCase().includes('manager') ? '#93c5fd' : '#86efac',
                  fontWeight: 600,
                }}
              >
                <ShieldCheck size={12} />
                {userRole}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
