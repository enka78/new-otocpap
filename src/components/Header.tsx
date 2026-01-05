"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, User, Globe, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import CartSidebar from "./CartSidebar";
import AdminPanelLink from "./AdminPanelLink";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [hasOrders, setHasOrders] = useState(false);

  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { getTotalItems, isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkUserOrders(user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserOrders(session.user.id);
      } else {
        setHasOrders(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserOrders = async (userId: string) => {
    try {
      // Get all orders since user field is now JSON
      const { data, error } = await supabase
        .from("orders")
        .select("id, user")
        .limit(100); // Get reasonable amount to check

      if (!error && data && data.length > 0) {
        // Filter orders by user_id from JSON data
        const userOrders = data.filter((order) => {
          try {
            const userInfo =
              typeof order.user === "string"
                ? JSON.parse(order.user)
                : order.user;
            return userInfo.user_id === userId;
          } catch (parseError) {
            // Fallback: check if user field directly matches userId (for old data)
            return order.user === userId;
          }
        });

        setHasOrders(userOrders.length > 0);
      } else {
        setHasOrders(false);
      }
    } catch (error) {
      console.error("Error checking user orders:", error);
      setHasOrders(false);
    }
  };

  const toggleLanguage = () => {
    const newLocale = locale === "tr" ? "en" : "tr";
    // Mevcut path'i al ve dil kısmını değiştir
    const currentPath = pathname.replace(`/${locale}`, "") || "/";
    const newPath = `/${newLocale}${currentPath}`;
    router.push(newPath);
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
            <div className="flex gap-2 text-2xl font-bold">
              <Image
                src="/logo.svg"
                alt="PayTR"
                width={26}
                height={26}
                className="object-contain"
              />
              <div>
                <span className="text-blue-600">Oto</span>
                <span className="text-gray-800">Cpap</span>
              </div>
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
            {user && hasOrders && (
              <Link
                href={`/${locale}/orders`}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("header.myOrders")}
              </Link>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Globe size={20} />
              <span className="text-sm font-medium">
                {locale === "tr" ? "EN" : "TR"}
              </span>
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
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
                {(user.user_metadata?.picture || user.user_metadata?.avatar_url) ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <Image
                      src={user.user_metadata.picture || user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name || "User Avatar"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                )}
                {/* Admin Panel Link */}
                <AdminPanelLink user={user} />
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors cursor-pointer"
                  title={t("header.logoutTitle")}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => handleAuthClick("login")}
                  className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                  title={t("header.loginTitle")}
                >
                  <User size={20} />
                </button>
                <button
                  onClick={() => handleAuthClick("register")}
                  className="bg-blue-600 cursor-pointer text-sm text-white  p-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  title={t("header.registerTitle")}
                >
                  {t("header.signUp")}
                </button>
              </div>
            )}

            {/* Mobile User Icon - only show when not logged in */}
            {!loading && !user && (
              <button
                onClick={() => handleAuthClick("login")}
                className="md:hidden text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                title={t("header.loginTitle")}
              >
                <User size={20} />
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 cursor-pointer"
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
              {user && hasOrders && (
                <Link
                  href={`/${locale}/orders`}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {t("header.myOrders")}
                </Link>
              )}

              {/* Mobile Auth Buttons */}
              {!loading && !user && (
                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => handleAuthClick("login")}
                    className="w-full text-left text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {t("header.login")}
                  </button>
                  <button
                    onClick={() => handleAuthClick("register")}
                    className="w-full text-left bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {t("header.signUp")}
                  </button>
                </div>
              )}

              {/* Mobile User Info */}
              {user && (
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-3 text-gray-700">
                    {(user.user_metadata?.picture || user.user_metadata?.avatar_url) && (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                        <Image
                          src={user.user_metadata.picture || user.user_metadata.avatar_url}
                          alt={user.user_metadata.full_name || "User Avatar"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <span>{user.user_metadata?.full_name || user.email}</span>
                  </div>
                  {/* Mobile Admin Panel Link */}
                  <AdminPanelLink user={user} isMobile={true} />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    {t("header.logout")}
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
