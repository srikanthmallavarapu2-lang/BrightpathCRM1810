import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Sparkles, 
  Settings, 
  ShieldCheck, 
  Briefcase, 
  Headphones, 
  ArrowRight,
  X
} from 'lucide-react';
import { NavigationTab } from '../layout/Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenCreateLead: () => void;
  onOpenSimulator: () => void;
  onSwitchToStudentPortal: () => void;
  onSwitchRole?: (role: 'admin' | 'manager' | 'counsellor') => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Actions' | 'Navigation' | 'Switch Role';
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenCreateLead,
  onOpenSimulator,
  onSwitchToStudentPortal,
  onSwitchRole,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'new-lead',
      title: 'Record New Student Enquiry',
      category: 'Actions',
      icon: Plus,
      shortcut: 'N',
      action: () => {
        onClose();
        onOpenCreateLead();
      },
    },
    {
      id: 'simulator',
      title: 'Launch Public Website Form Simulator',
      category: 'Actions',
      icon: Sparkles,
      shortcut: 'S',
      action: () => {
        onClose();
        onOpenSimulator();
      },
    },
    {
      id: 'student-portal',
      title: 'Open Public Student Portal Landing Page',
      category: 'Actions',
      icon: GraduationCap,
      shortcut: 'P',
      action: () => {
        onClose();
        onSwitchToStudentPortal();
      },
    },
    {
      id: 'nav-dashboard',
      title: 'Admissions Overview & KPIs',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => {
        onClose();
        onSelectTab('dashboard');
      },
    },
    {
      id: 'nav-leads',
      title: 'Student Leads Pipeline & Pipeline Grid',
      category: 'Navigation',
      icon: Users,
      action: () => {
        onClose();
        onSelectTab('leads');
      },
    },
    {
      id: 'nav-followups',
      title: 'Follow-ups & Overdue Schedule',
      category: 'Navigation',
      icon: Calendar,
      action: () => {
        onClose();
        onSelectTab('followups');
      },
    },
    {
      id: 'nav-settings',
      title: 'Academy Settings & Permissions',
      category: 'Navigation',
      icon: Settings,
      action: () => {
        onClose();
        onSelectTab('settings');
      },
    },
  ];

  if (onSwitchRole) {
    commands.push(
      {
        id: 'role-admin',
        title: 'Switch Role to Administrator (Dr. S. K. Jenkins)',
        category: 'Switch Role',
        icon: ShieldCheck,
        action: () => {
          onClose();
          onSwitchRole('admin');
        },
      },
      {
        id: 'role-manager',
        title: 'Switch Role to Branch Manager (Marcus Vance)',
        category: 'Switch Role',
        icon: Briefcase,
        action: () => {
          onClose();
          onSwitchRole('manager');
        },
      },
      {
        id: 'role-counsellor',
        title: 'Switch Role to Counsellor (Sarah Jenkins)',
        category: 'Switch Role',
        icon: Headphones,
        action: () => {
          onClose();
          onSwitchRole('counsellor');
        },
      }
    );
  }

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div 
        className="command-palette-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <div className="command-input-container">
          <Search size={18} color="#94a3b8" />
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="Type a command, action, or navigate..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <span className="command-kbd">ESC to exit</span>
        </div>

        <div className="command-list">
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={cmd.id}
                  className={`command-item ${isSelected ? 'active' : ''}`}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      style={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: 6, 
                        background: isSelected ? '#dbeafe' : '#f1f5f9',
                        color: isSelected ? '#2563eb' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cmd.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{cmd.category}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {cmd.shortcut && (
                      <span className="command-kbd">{cmd.shortcut}</span>
                    )}
                    <ArrowRight size={13} color={isSelected ? '#2563eb' : '#cbd5e1'} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="command-footer">
          <span>Navigate with <kbd className="command-kbd">↑</kbd> <kbd className="command-kbd">↓</kbd></span>
          <span>Select with <kbd className="command-kbd">↵ Enter</kbd></span>
          <span>Close with <kbd className="command-kbd">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
