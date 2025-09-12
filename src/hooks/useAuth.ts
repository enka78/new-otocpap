"use client";

import { useState, useEffect } from 'react';
import { supabase, handleAuthError } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        // First check if we have a valid session in localStorage
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session error:', error.message);
          await handleAuthError(error);
          setUser(null);
        } else if (session?.user) {
          // Verify the session is actually valid by making a test request
          try {
            const { error: testError } = await supabase.auth.getUser();
            if (testError) {
              console.warn('Session validation failed:', testError.message);
              await handleAuthError(testError);
              setUser(null);
            } else {
              setUser(session.user);
            }
          } catch (testError: any) {
            console.warn('Session test failed:', testError.message);
            await handleAuthError(testError);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error: any) {
        console.error('Error getting initial session:', error);
        await handleAuthError(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        try {
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
            setUser(session?.user ?? null);
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setUser(null);
          } else if (event === 'SIGNED_IN') {
            console.log('User signed in');
            setUser(session?.user ?? null);
          } else {
            setUser(session?.user ?? null);
          }
          
          setLoading(false);
        } catch (error: any) {
          console.error('Error in auth state change:', error);
          await handleAuthError(error);
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [mounted]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        // Even if signOut fails, clear the local state
        setUser(null);
      }
    } catch (error: any) {
      console.error('Exception during sign out:', error);
      setUser(null);
    }
  };

  return {
    user,
    loading,
    signOut,
  };
}