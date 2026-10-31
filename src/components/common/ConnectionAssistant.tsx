import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { checkSupabaseHealth, isSupabaseConfigured, getSupabaseConfig } from '../../lib/supabaseClient';
import { DatabaseHealthStatus } from '../../types/database';

interface ConnectionAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionAssistant: React.FC<ConnectionAssistantProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<DatabaseHealthStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const configured = isSupabaseConfigured();
  const config = getSupabaseConfig();

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const result = await checkSupabaseHealth();
      setHealth(result);
    } finally {
      setIsTesting(false);
    }
  };

  const envSnippet = `# BrightPath CRM - Supabase Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 120,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div 
        className="card fade-in-slide"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          padding: '1.75rem',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="assistant-title"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 'var(--radius-md)', 
                background: 'linear-gradient(135deg, #059669, #10b981)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <h3 id="assistant-title" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Supabase Integration Assistant
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Phase 2: Environment Resilience & Connection Health Check
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close assistant">
            <X size={18} />
          </button>
        </div>

        {/* Current State Indicator */}
        <div 
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: configured ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${configured ? '#a7f3d0' : '#fde68a'}`,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          {configured ? (
            <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ fontSize: '0.85rem' }}>
            <h4 style={{ fontWeight: 700, color: configured ? '#065f46' : '#92400e', marginBottom: '0.2rem' }}>
              {configured ? 'Environment Variables Detected' : 'Setup Required: Missing .env Configuration'}
            </h4>
            <p style={{ color: configured ? '#047857' : '#78350f', lineHeight: 1.4 }}>
              {configured 
                ? `Vite runtime detected URL: ${config.url}. Ready to verify live database ping.`
                : 'The application is running in safe development mode. To persist live data and enable authentication, add your Supabase project credentials to .env.'}
            </p>
          </div>
        </div>

        {/* Setup Instructions */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Local Environment Template</span>
            <button 
              onClick={copyToClipboard}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', gap: '4px' }}
            >
              {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Template'}</span>
            </button>
          </h4>
          <pre className="code-box">
            {envSnippet}
          </pre>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            File location: <code className="code-font" style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>brightpath-crm/.env</code>
          </p>
        </div>

        {/* Diagnostic Actions */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Diagnostic Health Check</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ping Supabase backend directly from the browser</p>
            </div>
            <button 
              onClick={handleTestConnection}
              disabled={isTesting}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              <Activity size={14} />
              <span>{isTesting ? 'Pinging Backend...' : 'Run Ping Test'}</span>
            </button>
          </div>

          {health && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`radar-dot ${health.isConnected ? 'connected' : 'error'}`} />
                <strong>Result:</strong> {health.isConnected ? 'Connected Successfully' : 'Ping Failed'}
                {health.latencyMs !== null && (
                  <span style={{ color: 'var(--text-muted)' }}>({health.latencyMs} ms latency)</span>
                )}
              </div>
              {health.errorMessage && (
                <div style={{ color: '#b91c1c', marginTop: '0.3rem', fontSize: '0.75rem' }}>
                  {health.errorMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Rule Reminder */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.75rem',
            color: '#b91c1c',
          }}
        >
          <ShieldAlert size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Security Notice:</strong> Only paste your public <code className="code-font">anon</code> key in frontend code. Never paste your Supabase <code className="code-font">service_role</code> secret or database password into client apps.
          </span>
        </div>

        {/* External Link */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '0.8rem', color: 'var(--primary-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
          >
            <span>Open Supabase Console</span>
            <ExternalLink size={13} />
          </a>
          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
