import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.success) {
          onClose();
        } else {
          setErrorMessage(result.error);
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please provide your full name.');
          setIsSubmitting(false);
          return;
        }
        const result = await signUp(email, password, fullName);
        if (result.success) {
          onClose();
        } else {
          setErrorMessage(result.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('counsellor@brightpath.edu');
    setPassword('BrightPath@2026');
    setFullName('Sarah Jenkins');
    setErrorMessage(null);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 130,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div 
        className="card fade-in-slide"
        style={{
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          padding: '2rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="btn-icon" 
          style={{ position: 'absolute', right: '1.25rem', top: '1.25rem' }}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div 
            style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 'var(--radius-md)', 
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
              color: 'white', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              marginBottom: '0.75rem',
            }}
          >
            <GraduationCap size={26} />
          </div>
          <h3 id="auth-modal-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {mode === 'signin' ? 'Welcome Back' : 'Create Staff Account'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {mode === 'signin' 
              ? 'Sign in to access your assigned leads and follow-ups' 
              : 'Register your staff account to join the admissions pipeline'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
            style={{
              padding: '0.5rem',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: mode === 'signin' ? 'white' : 'transparent',
              color: mode === 'signin' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: mode === 'signin' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            style={{
              padding: '0.5rem',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: mode === 'signup' ? 'white' : 'transparent',
              color: mode === 'signup' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: mode === 'signup' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div 
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
            {errorMessage.toLowerCase().includes('rate limit') && (
              <div style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '0.25rem', lineHeight: 1.4, background: 'rgba(255,255,255,0.7)', padding: '0.5rem', borderRadius: 4 }}>
                💡 <strong>Quick Fix:</strong> In your Supabase Dashboard under <strong>Authentication &rarr; Providers &rarr; Email</strong>, toggle <strong>"Confirm email" OFF</strong> and click <strong>Save</strong>. This eliminates the email sending rate limit for development signups!
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="name@brightpath.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 2.5rem 0.6rem 2.4rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {mode === 'signup' && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Must be at least 6 characters. Default role will be Counsellor.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.7rem', marginTop: '0.5rem', fontSize: '0.9rem' }}
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : mode === 'signin' ? (
              <>
                <LogIn size={16} />
                <span>Sign In to CRM</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Staff Account</span>
              </>
            )}
          </button>
        </form>

        {/* Workshop Quick Fill Button */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-outline"
            style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', gap: '5px' }}
          >
            <Sparkles size={13} color="#2563eb" />
            <span>Pre-fill Sample Credentials (Workshop)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
