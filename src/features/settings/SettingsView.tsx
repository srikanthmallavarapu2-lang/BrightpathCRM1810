import React, { useState, useEffect } from 'react';
import { Shield, Building, Database, Mail, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface SettingsViewProps {
  onOpenAssistant?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenAssistant }) => {
  const { user, profile, role } = useAuth();
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const isConfigured = isSupabaseConfigured();

  const pingDatabase = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await supabase.from('profiles').select('id', { head: true, count: 'exact' });
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
    } catch {
      setLatencyMs(null);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    if (isConfigured) {
      pingDatabase();
    }
  }, [isConfigured]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formattedRole = role 
    ? role.charAt(0).toUpperCase() + role.slice(1) 
    : 'Counsellor';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '880px' }}>
      {/* Current User Staff Profile Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 'var(--radius-full)', 
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}
            >
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {profile?.full_name || 'Staff Member'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Active Session &amp; Credential Identity
              </p>
            </div>
          </div>
          <span 
            className={`status-badge ${role === 'admin' ? 'converted' : role === 'manager' ? 'qualified' : 'new'}`}
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
          >
            Role: {formattedRole}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Email Address
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }}>
              <Mail size={15} color="#64748b" />
              <span>{user?.email || 'Not Signed In'}</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Account Created
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }}>
              <Calendar size={15} color="#64748b" />
              <span>{formatDate(profile?.created_at || user?.created_at)}</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Security ID (UUID)
            </label>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', background: '#f8fafc', padding: '0.35rem 0.5rem', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.id || 'Anonymous'}
            </div>
          </div>
        </div>
      </div>

      {/* Institute Profile Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Building size={20} color="#2563eb" />
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Academy Information</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Organization identity and operations</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Institute Name
            </label>
            <input 
              type="text" 
              readOnly 
              value="BrightPath Academy" 
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: '#f8fafc', fontSize: '0.875rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Primary Branch Location
            </label>
            <input 
              type="text" 
              readOnly 
              value="Bengaluru Central Campus" 
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: '#f8fafc', fontSize: '0.875rem' }} 
            />
          </div>
        </div>
      </div>

      {/* Role Access Matrix */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Shield size={20} color="#4f46e5" />
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Role &amp; Permissions Matrix</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Row Level Security (RLS) policies enforced in Supabase</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { role: 'Administrator', access: 'Complete access to institute settings, all counsellors, and global lead pipeline.' },
            { role: 'Manager', access: 'Team-level pipeline auditing, lead reassignment, and overdue follow-up monitoring.' },
            { role: 'Counsellor (Default)', access: 'Restricted to creating and updating assigned enquiries and follow-ups only.' },
          ].map((item) => (
            <div 
              key={item.role} 
              style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: '#f8fafc', border: '1px solid var(--border-subtle)' }}
            >
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-700)' }}>{item.role}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{item.access}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Database Connection Status Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={20} color="#059669" />
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Supabase Backend Health</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PostgreSQL connection, environment resilience, and live diagnostics</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={pingDatabase} 
              disabled={isPinging}
              className="btn btn-outline" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', gap: '5px' }}
            >
              <RefreshCw size={13} className={isPinging ? 'spin' : ''} />
              <span>Ping Latency</span>
            </button>
            {onOpenAssistant && (
              <button onClick={onOpenAssistant} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                <Database size={14} />
                <span>Assistant</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: '#f8fafc', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span className="radar-dot connected" />
            <strong>Runtime Status:</strong> Live &amp; Connected {latencyMs !== null ? `(~${latencyMs}ms latency)` : ''}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Supabase Project ID: <code className="code-font" style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 3 }}>xurqhphtcucdgxfrqiff</code> &bull; RLS Security: <strong>Enforced</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
