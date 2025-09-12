/**
 * Utility functions for URL generation and environment handling
 */

/**
 * Get the base URL for the application
 * Uses www.otocpap.com in production, NEXT_PUBLIC_SITE_URL for custom domains, falls back to window.location.origin
 */
export const getBaseUrl = (): string => {
  // In server-side rendering or build time
  if (typeof window === 'undefined') {
    // Check if we're in production with Vercel deployment
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
      return 'https://www.otocpap.com';
    }
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
  
  // In client-side, check current domain and redirect logic
  const currentOrigin = window.location.origin;
  
  // If we're on Vercel preview/deployment but want to use production domain
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
    return 'https://www.otocpap.com';
  }
  
  // Use environment variable if set, otherwise current origin
  return process.env.NEXT_PUBLIC_SITE_URL || currentOrigin;
};

/**
 * Get the current locale from the pathname
 * Defaults to 'tr' if not found
 * Handles both Vercel and production domain scenarios
 */
export const getCurrentLocale = (): string => {
  if (typeof window === 'undefined') {
    return 'tr'; // Default locale for SSR
  }
  
  const pathname = window.location.pathname;
  const locale = pathname.split('/')[1];
  
  // Check if it's a valid locale (you can extend this list)
  const validLocales = ['tr', 'en'];
  return validLocales.includes(locale) ? locale : 'tr';
};

/**
 * Generate password reset redirect URL with proper locale
 * Always uses the production domain (www.otocpap.com) for email links
 */
export const getPasswordResetUrl = (): string => {
  const baseUrl = getBaseUrl();
  const locale = getCurrentLocale();
  return `${baseUrl}/${locale}/auth/reset-password`;
};

/**
 * Check if running in production environment
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if running in development environment
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};