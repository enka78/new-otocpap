'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Lock } from 'lucide-react';
import Logo from '@/components/Logo';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidResetLink, setIsValidResetLink] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');

  useEffect(() => {
    // Check if we have the required tokens from the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      // No tokens means user accessed page directly, not from email link
      setIsValidResetLink(false);
      return;
    }

    // We have tokens, try to set the session
    const setSessionAsync = async () => {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          setError(t('invalidResetLink'));
          setIsValidResetLink(false);
        } else {
          setIsValidResetLink(true);
        }
      } catch (err) {
        setError(t('invalidResetLink'));
        setIsValidResetLink(false);
      }
    };
    
    setSessionAsync();
  }, [searchParams, t]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return { isValid: false, message: t('passwordMinLength') };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: t('passwordUppercase') };
    }
    
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: t('passwordNumber') };
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: t('passwordSpecial') };
    }
    
    return { isValid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(t('passwordResetSuccess'));
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      setError(error.message || t('passwordResetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('resetPasswordTitle')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('resetPasswordDescription')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Show form only if we have a valid reset link */}
          {isValidResetLink === null && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('loading') || 'Yükleniyor...'}</p>
            </div>
          )}

          {isValidResetLink === false && !error && (
            <div className="text-center py-8">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                <p className="mb-2">{t('resetPasswordDirectAccess') || 'Şifre sıfırlama sayfasına doğrudan eriştiniz.'}</p>
                <p>{t('resetPasswordDirectAccessDesc') || 'Şifrenizi sıfırlamak için e-posta adresinize gönderilen bağlantıyı kullanmalısınız.'}</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('backToLogin')}
              </button>
            </div>
          )}

          {isValidResetLink === true && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('newPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('newPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('confirmNewPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('confirmNewPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('resettingPassword') : t('resetPasswordButton')}
            </button>
            </form>
          )}

          {isValidResetLink === true && (
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {t('backToLogin')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}