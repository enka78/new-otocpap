"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X, ShoppingCart, User, Globe, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import CartSidebar from "./CartSidebar";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  const t = useTranslations();
  const locale = useLocale();
  const { getTotalItems, isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === "tr" ? "en" : "tr";
    window.location.href = `/${newLocale}`;
  };

  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex flex-col items-center">
            <div className="text-2xl font-bold">
              <span className="text-blue-600">Oto</span>
              <span className="text-gray-800">Cpap</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href={`/${locale}`}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t("nav.home")}
            </Link>
            <Link
              href={`/${locale}/products`}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t("nav.products")}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t("nav.blog")}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t("nav.about")}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t("nav.contact")}
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Globe size={20} />
              <span className="text-sm font-medium">
                {locale.toUpperCase()}
              </span>
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart size={20} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* User */}
            {loading ? (
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 hidden sm:block">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                  title="Çıkış Yap"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAuthClick("login")}
                className="text-gray-700 hover:text-blue-600 transition-colors"
                title="Giriş Yap"
              >
                <User size={20} />
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                href={`/${locale}`}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("nav.home")}
              </Link>
              <Link
                href={`/${locale}/products`}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("nav.products")}
              </Link>
              <Link
                href={`/${locale}/blog`}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("nav.blog")}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("nav.about")}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("nav.contact")}
              </Link>

              {/* Mobile Auth Buttons */}
              {!loading && !user && (
                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => handleAuthClick("login")}
                    className="w-full text-left text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => handleAuthClick("register")}
                    className="w-full text-left bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Üye Ol
                  </button>
                </div>
              )}

              {/* Mobile User Info */}
              {user && (
                <div className="pt-4 border-t space-y-2">
                  <div className="text-gray-700">
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 hover:text-red-700 transition-colors"
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
