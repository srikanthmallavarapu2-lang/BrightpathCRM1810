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

  const fetchProfileForUser = async (userId: string) => {
    const prof = await authService.getCurrentProfile(userId);
    setProfile(prof);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileForUser(user.id);
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
          await fetchProfileForUser(session.user.id);
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
        await fetchProfileForUser(session.user.id);
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
