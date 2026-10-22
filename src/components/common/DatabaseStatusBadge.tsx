import React, { useEffect, useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { checkSupabaseHealth, isSupabaseConfigured } from '../../lib/supabaseClient';
import { DatabaseHealthStatus } from '../../types/database';

interface DatabaseStatusBadgeProps {
  onOpenAssistant?: () => void;
}

export const DatabaseStatusBadge: React.FC<DatabaseStatusBadgeProps> = ({ onOpenAssistant }) => {
  const [health, setHealth] = useState<DatabaseHealthStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const runCheck = async () => {
    setChecking(true);
    try {
      const status = await checkSupabaseHealth();
      setHealth(status);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const configured = isSupabaseConfigured();

  const getStatusDetails = () => {
    if (!configured) {
      return {
        label: 'Supabase: Setup Mode',
        dotClass: 'setup',
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.25)',
        text: '#b45309',
      };
    }
    if (health?.isConnected) {
      return {
        label: `Supabase: Connected (${health.latencyMs}ms)`,
        dotClass: 'connected',
        bg: 'rgba(16, 185, 129, 0.08)',
        border: 'rgba(16, 185, 129, 0.25)',
        text: '#047857',
      };
    }
    return {
      label: 'Supabase: Offline',
      dotClass: 'error',
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.25)',
      text: '#b91c1c',
    };
  };

  const details = getStatusDetails();

  return (
    <div
      onClick={onOpenAssistant}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenAssistant?.();
        }
      }}
      title="Click to view database connection diagnostics"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        background: details.bg,
        border: `1px solid ${details.border}`,
        color: details.text,
        fontSize: '0.785rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none',
      }}
    >
      <Database size={13} />
      <span className={`radar-dot ${details.dotClass}`} />
      <span>{checking ? 'Checking ping...' : details.label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          runCheck();
        }}
        className="btn-icon"
        style={{
          width: 18,
          height: 18,
          border: 'none',
          background: 'transparent',
          color: details.text,
          padding: 0,
        }}
        title="Refresh connection ping"
        aria-label="Refresh connection ping"
      >
        <RefreshCw size={11} className={checking ? 'spin' : ''} />
      </button>
    </div>
  );
};
