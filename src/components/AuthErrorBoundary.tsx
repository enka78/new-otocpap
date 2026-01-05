"use client";

import { Component, ReactNode } from 'react';
import { handleAuthError, clearAuthState } from '@/lib/supabase';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an auth-related error
    if (error.message?.includes('Invalid Refresh Token') ||
      error.message?.includes('Refresh Token Not Found') ||
      error.message?.includes('AuthApiError')) {
      return { hasError: true, error };
    }

    // For non-auth errors, don't catch them
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Auth error caught by boundary:', error, errorInfo);

    // Handle the auth error
    handleAuthError(error).then(() => {

    }).catch((handleError) => {
      console.error('Error handling auth error:', handleError);
      // Force clear everything as a last resort
      clearAuthState();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    });
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or null to let the app redirect
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4">
              Please wait while we redirect you to the login page...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}