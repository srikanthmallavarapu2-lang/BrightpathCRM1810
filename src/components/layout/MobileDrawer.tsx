import React from 'react';
import { 
  X, 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Clock, 
  Settings,
  ShieldCheck
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userRole?: string;
  userName?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  userRole = 'Counsellor',
  userName = 'Demo Counsellor',
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads' as NavigationTab, label: 'Leads Pipeline', icon: Users },
    { id: 'followups' as NavigationTab, label: 'Follow-ups', icon: Clock, badge: '2 Overdue' },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: NavigationTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div 
      className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div 
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Mobile Navigation"
      >
        {/* Drawer Header */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box">
              <GraduationCap size={22} color="#ffffff" />
            </div>
            <div>
              <span className="brand-title">BrightPath</span>
              <span className="brand-badge">CRM</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn-icon"
            style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Nav Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge-pill">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar-initials">DC</div>
            <div className="user-meta">
              <p className="user-name">{userName}</p>
              <span className="user-role-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="#60a5fa" />
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
