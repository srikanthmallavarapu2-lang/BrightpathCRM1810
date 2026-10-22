import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Settings, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export type NavigationTab = 'dashboard' | 'leads' | 'followups' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: string;
  userName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  userRole = 'Counsellor',
  userName = 'Demo Counsellor',
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads' as NavigationTab, label: 'Leads Pipeline', icon: Users },
    { id: 'followups' as NavigationTab, label: 'Follow-ups', icon: Clock, badge: '2 Overdue' },
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
          <div className="brand-icon-box">
            <GraduationCap size={22} color="#ffffff" />
          </div>
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
        <div className="user-profile-widget">
          <div className="user-avatar-initials" title={userName}>
            {getInitials(userName)}
          </div>
          {!isCollapsed && (
            <div className="user-meta">
              <p className="user-name">{userName}</p>
              <span className="user-role-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="#60a5fa" />
                {userRole}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
