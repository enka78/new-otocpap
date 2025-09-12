/**
 * Utility functions for URL generation and environment handling
 */

/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_SITE_URL in production, falls back to window.location.origin
 */
export const getBaseUrl = (): string => {
  // In server-side rendering or build time
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
  
  // In client-side, prefer environment variable but fallback to current origin
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
};

/**
 * Get the current locale from the pathname
 * Defaults to 'tr' if not found
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