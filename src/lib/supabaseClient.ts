import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseHealthStatus } from '../types/database';

// Read public environment variables from Vite runtime
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

/**
 * Checks whether Supabase environment variables are provided and valid.
 * Protects against placeholder keys or empty values.
 */
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  // Check if placeholder values were left in .env
  if (
    supabaseUrl.includes('your-project') ||
    supabaseUrl.includes('example.com') ||
    supabaseAnonKey.includes('your-anon') ||
    supabaseAnonKey.includes('your-public')
  ) {
    return false;
  }
  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

/**
 * Safe client initialization:
 * Uses real credentials if configured; uses a fallback harmless configuration
 * to prevent module-level crashes during initial setup.
 */
const clientUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const clientKey = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Returns redacted configuration info for diagnostics.
 */
export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl || null,
    hasKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes('your-anon')),
    isConfigured: isSupabaseConfigured(),
  };
};

/**
 * Executes a live health check ping against the Supabase backend.
 * Measures round-trip latency and returns diagnostic status.
 */
export const checkSupabaseHealth = async (): Promise<DatabaseHealthStatus> => {
  const configured = isSupabaseConfigured();
  
  if (!configured) {
    return {
      isConfigured: false,
      isConnected: false,
      latencyMs: null,
      errorMessage: 'Missing or placeholder VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env file',
      url: supabaseUrl || null,
      checkedAt: new Date().toLocaleTimeString(),
    };
  }

  const startTime = performance.now();
  try {
    // Perform a lightweight public check (auth session or ping)
    const { error } = await supabase.auth.getSession();
    const latency = Math.round(performance.now() - startTime);

    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        latencyMs: latency,
        errorMessage: error.message,
        url: supabaseUrl,
        checkedAt: new Date().toLocaleTimeString(),
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      latencyMs: latency,
      errorMessage: null,
      url: supabaseUrl,
      checkedAt: new Date().toLocaleTimeString(),
    };
  } catch (err: unknown) {
    const latency = Math.round(performance.now() - startTime);
    const message = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      isConfigured: true,
      isConnected: false,
      latencyMs: latency,
      errorMessage: message,
      url: supabaseUrl,
      checkedAt: new Date().toLocaleTimeString(),
    };
  }
};
