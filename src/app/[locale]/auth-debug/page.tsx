"use client";

import { useEffect, useState } from 'react';
import { supabase, clearAuthState, hasValidSession } from '@/lib/supabase';

export default function AuthDebugPage() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const hasValid = await hasValidSession();

      setAuthInfo({
        session,
        sessionError: error,
        user,
        userError,
        hasValidSession: hasValid,
        localStorage: typeof window !== 'undefined' ? {
          authToken: localStorage.getItem('supabase.auth.token'),
          supabaseKeys: Object.keys(localStorage).filter(key => key.startsWith('sb-'))
        } : null
      });
    } catch (error) {
      setAuthInfo({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAuth = () => {
    clearAuthState();
    setTimeout(() => {
      checkAuthState();
    }, 1000);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setTimeout(() => {
        checkAuthState();
      }, 1000);
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading auth debug info...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Information</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={checkAuthState}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh Auth State
        </button>
        
        <button
          onClick={handleClearAuth}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
        >
          Clear Auth State
        </button>
        
        <button
          onClick={handleSignOut}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 ml-2"
        >
          Sign Out
        </button>
      </div>

      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(authInfo, null, 2)}
      </pre>
    </div>
  );
}