import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with fallback for web
const getSupabaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_URL) {
    return process.env.EXPO_PUBLIC_SUPABASE_URL;
  }
  // Fallback for web environment
  return '';
};

const getSupabaseAnonKey = (): string => {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  }
  // Fallback for web environment
  return '';
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Track if credentials are available
export const hasValidCredentials = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client with proper configuration
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Some features may be unavailable.');
  // Create a client with placeholder - but we'll guard against using it
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-anon-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        // Custom fetch that silently fails for placeholder
        fetch: async (url, options) => {
          if (url.toString().includes('placeholder.supabase.co')) {
            // Return a mock response to prevent network errors
            return new Response(JSON.stringify({ error: 'No credentials' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          return fetch(url, options);
        },
      },
    }
  );
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

export { supabase };
