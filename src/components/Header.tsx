"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, User, Globe, LogOut, Home, ShoppingBag, BookOpen, Info, Phone, Package, ChevronRight } from "lucide-react";
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
              className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
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

        {/* Mobile Navigation Overlay */}
        <div
          className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Content */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-lg text-gray-900">Menü</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                  {[
                    { href: `/${locale}`, label: t("nav.home"), icon: Home },
                    { href: `/${locale}/products`, label: t("nav.products"), icon: ShoppingBag },
                    { href: `/${locale}/blog`, label: t("nav.blog"), icon: BookOpen },
                    { href: `/${locale}/about`, label: t("nav.about"), icon: Info },
                    { href: `/${locale}/contact`, label: t("nav.contact"), icon: Phone },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className="text-gray-400 group-hover:text-blue-500" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400" />
                    </Link>
                  ))}

                  {user && hasOrders && (
                    <Link
                      href={`/${locale}/orders`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Package size={20} className="text-gray-400 group-hover:text-blue-500" />
                        <span className="font-medium">{t("header.myOrders")}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400" />
                    </Link>
                  )}
                </nav>

                <div className="my-6 border-t border-gray-100" />

                {/* User Section */}
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-3">
                      {(user.user_metadata?.picture || user.user_metadata?.avatar_url) ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100">
                          <Image
                            src={user.user_metadata.picture || user.user_metadata.avatar_url}
                            alt={user.user_metadata.full_name || "User Avatar"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {(user.user_metadata?.full_name?.[0] || user.email?.[0]).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-gray-900 truncate">
                          {user.user_metadata?.full_name || user.email}
                        </span>
                        <AdminPanelLink user={user} isMobile={true} />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">{t("header.logout")}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 px-2">
                    <button
                      onClick={() => {
                        handleAuthClick("login");
                        setIsMenuOpen(false);
                      }}
                      className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                    >
                      {t("header.login")}
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick("register");
                        setIsMenuOpen(false);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                    >
                      {t("header.signUp")}
                    </button>
                  </div>
                )}
              </div>

              {/* Language Switcher in Menu */}
              <div className="p-6 bg-gray-50 mt-auto">
                <button
                  onClick={() => {
                    toggleLanguage();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Globe size={20} className="text-blue-500" />
                  <span className="font-bold">
                    {locale === "tr" ? "English'e Geç" : "Switch to Turkish"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
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
