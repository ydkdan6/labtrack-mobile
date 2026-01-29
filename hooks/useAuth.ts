import { useState, useEffect, useCallback } from 'react';
import { supabase, hasValidCredentials } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
}

// Helper to check if error is a network error
const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network request failed') ||
      message.includes('network error') ||
      message.includes('failed to fetch') ||
      message.includes('timeout')
    );
  }
  return false;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Skip auth if no valid credentials
      if (!hasValidCredentials) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          // Don't spam console for network errors
          if (!isNetworkError(error)) {
            console.warn('Auth session error:', error.message);
          } else {
            setNetworkError(true);
          }
          setLoading(false);
          return;
        }
        
        setNetworkError(false);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (!isNetworkError(err)) {
          console.warn('Auth initialization error:', err);
        } else {
          setNetworkError(true);
        }
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Skip subscription if no valid credentials
    if (!hasValidCredentials) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
  if (!mounted) return;
  
  setSession(session);
  setUser(session?.user ?? null);
  
  if (session?.user) {
    await fetchProfile(session.user.id);
    // fetchProfile already sets loading to false
  } else {
    setProfile(null);
    setLoading(false);
  }
});

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!hasValidCredentials) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Don't spam console for network errors
        if (!isNetworkError(error)) {
          console.warn('Error fetching profile:', error.message);
        } else {
          setNetworkError(true);
        }
        // Don't throw - allow user to continue without profile
      } else {
        setNetworkError(false);
        setProfile(data);
      }
    } catch (error: unknown) {
      if (!isNetworkError(error)) {
        console.warn('Profile fetch error:', error);
      } else {
        setNetworkError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!hasValidCredentials) return;
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      if (!isNetworkError(err)) {
        console.warn('Sign out error:', err);
      }
    }
  }, []);

  return {
    session,
    user,
    profile,
    loading,
    networkError,
    signOut,
    isAuthenticated: !!session,
    isAdmin: profile?.role === 'admin',
    hasCredentials: hasValidCredentials,
  };
}