import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';

interface LayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onQuickAction?: () => void;
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  onQuickAction,
  children,
  userRole = 'Counsellor',
  userName = 'Demo Counsellor',
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
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        userRole={userRole}
        userName={userName}
      />

      {/* Main Workspace Frame */}
      <div className="main-viewport">
        <Header
          currentTab={currentTab}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          onQuickAction={onQuickAction}
          userRole={userRole}
          userName={userName}
        />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};
