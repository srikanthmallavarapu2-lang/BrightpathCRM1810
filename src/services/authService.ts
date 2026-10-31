import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types/database';
import { User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  profile: Profile | null;
  error: string | null;
}

/**
 * Service methods for Supabase Authentication and Profile management.
 */
export const authService = {
  /**
   * Signs in an existing user with email and password.
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, profile: null, error: 'User account not found.' };
      }

      const profile = await this.getCurrentProfile(data.user.id);
      return { user: data.user, profile, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
      return { user: null, profile: null, error: message };
    }
  },

  /**
   * Registers a new user and sets full_name metadata.
   * Supabase trigger on_auth_user_created automatically creates the public.profiles row.
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, profile: null, error: 'Registration failed. Please try again.' };
      }

      // Allow a brief moment for database trigger to create profile
      let profile = await this.getCurrentProfile(data.user.id);
      
      // Fallback: if trigger was delayed, create profile manually
      if (!profile) {
        profile = await this.ensureProfileExists(data.user.id, fullName.trim());
      }

      return { user: data.user, profile, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      return { user: null, profile: null, error: message };
    }
  },

  /**
   * Terminates the active Supabase session.
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign out.';
      return { error: message };
    }
  },

  /**
   * Retrieves the current authenticated user session.
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves user profile from public.profiles.
   */
  async getCurrentProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile from public.profiles:', error.message);
        return null;
      }
      return data as Profile;
    } catch {
      return null;
    }
  },

  /**
   * Ensures a profile exists for the user (fallback if trigger is delayed).
   */
  async ensureProfileExists(userId: string, fullName: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          role: 'counsellor',
        })
        .select()
        .maybeSingle();

      if (error) {
        console.warn('Profile fallback insert note:', error.message);
        return null;
      }
      return data as Profile;
    } catch {
      return null;
    }
  },

  /**
   * Updates user full name in public.profiles.
   */
  async updateFullName(userId: string, fullName: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update profile name.';
      return { success: false, error: message };
    }
  },
};
