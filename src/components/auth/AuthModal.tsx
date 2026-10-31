import React, { useState, useEffect } from 'react';
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
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

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
  const [showSwitchForm, setShowSwitchForm] = useState(false);

  const { user, profile, role, isAuthenticated, signIn, signUp, signOut } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setFullName('');
      setErrorMessage(null);
      setShowSwitchForm(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.success) {
          toast.success('Signed in successfully.');
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
          toast.success('Account created and signed in.');
          onClose();
        } else {
          setErrorMessage(result.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.info('Signed out of session.');
    setShowSwitchForm(true);
  };

  const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Counsellor';

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
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div 
            style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 'var(--radius-lg)', 
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
              color: 'white', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)',
              marginBottom: '0.75rem',
            }}
          >
            <GraduationCap size={26} />
          </div>

          {/* Already Authenticated View */}
          {isAuthenticated && !showSwitchForm ? (
            <div>
              <h3 id="auth-modal-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Active Session
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                You are currently signed in to BrightPath CRM
              </p>

              <div 
                style={{ 
                  margin: '1.5rem 0', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  background: '#f8fafc', 
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Staff Member:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {profile?.full_name || 'Staff User'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>
                    {user?.email}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Role:</span>
                  <span className={`status-badge ${role === 'admin' ? 'converted' : role === 'manager' ? 'qualified' : 'new'}`}>
                    {formattedRole}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out of This Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSwitchForm(true)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogIn size={16} />
                  <span>Sign In as Another Staff Member</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Create Account Form */
            <>
              <h3 id="auth-modal-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {mode === 'signin' ? 'Welcome Back' : 'Join Staff Portal'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {mode === 'signin' 
                  ? 'Sign in to access your assigned leads and follow-ups' 
                  : 'Register a new staff member account for BrightPath CRM'}
              </p>

              {/* Mode Toggle Tabs */}
              <div 
                style={{ 
                  display: 'flex', 
                  background: '#f1f5f9', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '3px', 
                  margin: '1.25rem 0 1rem 0' 
                }}
              >
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(null); }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    background: mode === 'signin' ? 'white' : 'transparent',
                    color: mode === 'signin' ? 'var(--text-main)' : 'var(--text-muted)',
                    boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(null); }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    background: mode === 'signup' ? 'white' : 'transparent',
                    color: mode === 'signup' ? 'var(--text-main)' : 'var(--text-muted)',
                    boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
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
                    padding: '0.75rem 1rem', 
                    borderRadius: 'var(--radius-md)', 
                    background: '#fef2f2', 
                    border: '1px solid #fee2e2', 
                    color: '#b91c1c', 
                    fontSize: '0.8rem', 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textAlign: 'left'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', textAlign: 'left' }}>
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
                      placeholder="counsellor@example.com"
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
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
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
                  style={{ width: '100%', padding: '0.7rem', marginTop: '0.5rem', fontSize: '0.9rem', justifyContent: 'center' }}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
