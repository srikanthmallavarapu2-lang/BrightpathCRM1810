import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';

interface LayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onQuickAction?: () => void;
  onOpenAssistant?: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  isAuthenticated?: boolean;
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
  overdueCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  onQuickAction,
  onOpenAssistant,
  onOpenAuthModal,
  onSignOut,
  isAuthenticated = false,
  children,
  userRole = 'Counsellor',
  userName = 'Demo Counsellor',
  overdueCount = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Desktop Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        userRole={userRole}
        userName={userName}
        overdueCount={overdueCount}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        userRole={userRole}
        userName={userName}
        overdueCount={overdueCount}
      />

      {/* Main Workspace Frame */}
      <div className="main-viewport">
        <Header
          currentTab={currentTab}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          onQuickAction={onQuickAction}
          onOpenAssistant={onOpenAssistant}
          onOpenAuthModal={onOpenAuthModal}
          onSignOut={onSignOut}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          userName={userName}
        />
        <main id="main-content" tabIndex={-1} className="content-area" style={{ outline: 'none' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
