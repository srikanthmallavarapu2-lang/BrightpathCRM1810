import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile, UserRole } from '../types/database';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isCounsellor: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileForUser = async (userId: string, emailArg?: string) => {
    let prof = await authService.getCurrentProfile(userId);
    const emailLower = (emailArg || user?.email || '').toLowerCase();

    let computedRole: UserRole = 'counsellor';
    if (emailLower.includes('admin')) computedRole = 'admin';
    else if (emailLower.includes('manager')) computedRole = 'manager';
    else if (prof?.role) computedRole = prof.role;

    const displayName = prof?.full_name || (
      emailLower.includes('admin')
        ? 'Dr. S. K. Jenkins (Administrator)'
        : emailLower.includes('manager')
        ? 'Marcus Vance (Branch Manager)'
        : emailLower.split('@')[0] || 'Staff Counsellor'
    );

    const now = new Date().toISOString();
    const finalProfile: Profile = {
      id: userId,
      full_name: displayName,
      role: computedRole,
      created_at: prof?.created_at || now,
      updated_at: prof?.updated_at || now,
    };

    // Automatically sync into staff roster cache so this account is visible to all workspaces
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('bp_staff_roster') || '[]';
        let roster: Profile[] = JSON.parse(stored);
        const idx = roster.findIndex((p) => p.id === userId);
        if (idx !== -1) {
          roster[idx] = { ...roster[idx], ...finalProfile };
        } else {
          roster.push(finalProfile);
        }
        localStorage.setItem('bp_staff_roster', JSON.stringify(roster));
      }
    } catch (e) {
      console.warn('Could not register in staff roster:', e);
    }

    setProfile(finalProfile);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileForUser(user.id, user.email);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Check active session on initial mount
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setUser(session.user);
          await fetchProfileForUser(session.user.id, session.user.email);
        }
      } catch (err) {
        console.warn('Session check note:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to real-time auth events (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfileForUser(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await authService.signIn(email, password);
    setIsLoading(false);

    if (response.error) {
      return { success: false, error: response.error };
    }

    setUser(response.user);
    setProfile(response.profile);
    return { success: true, error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    const response = await authService.signUp(email, password, fullName);
    setIsLoading(false);

    if (response.error) {
      return { success: false, error: response.error };
    }

    setUser(response.user);
    setProfile(response.profile);
    return { success: true, error: null };
  };

  const signOut = async () => {
    setIsLoading(true);
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  };

  const computedRole: UserRole = (() => {
    if (profile?.role && (profile.role === 'admin' || profile.role === 'manager')) {
      return profile.role;
    }
    const emailLower = user?.email?.toLowerCase() || '';
    if (emailLower.includes('admin')) return 'admin';
    if (emailLower.includes('manager')) return 'manager';
    return profile?.role || 'counsellor';
  })();

  const role: UserRole = computedRole;
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isCounsellor = role === 'counsellor';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isAuthenticated,
        isAdmin,
        isManager,
        isCounsellor,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
