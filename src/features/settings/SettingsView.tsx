import React from 'react';
import { Shield, Building, Database } from 'lucide-react';

interface SettingsViewProps {
  onOpenAssistant?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenAssistant }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '840px' }}>
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
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Role & Permissions Matrix</h2>
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
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PostgreSQL connection, environment resilience, and diagnostics</p>
            </div>
          </div>
          {onOpenAssistant && (
            <button onClick={onOpenAssistant} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              <Database size={14} />
              <span>Launch Assistant</span>
            </button>
          )}
        </div>

        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: '#f8fafc', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span className="radar-dot setup" />
            <strong>Runtime Status:</strong> Client initialized with graceful resilience guards
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            To configure your live Supabase project, click <strong>Launch Assistant</strong> above or update your local <code className="code-font" style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 3 }}>.env</code> file.
          </p>
        </div>
      </div>
    </div>
  );
};
