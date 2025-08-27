"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  getUserPermissions,
  hasPermission,
  UserPermissions,
} from "@/lib/permissions";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Building2,
  FileText,
  Image,
  ShoppingCart,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import ProductsManager from "./ProductsManager";
import OrdersManager from "./OrdersManager";
import CategoriesManager from "./CategoriesManager";
import BrandsManager from "./BrandsManager";
import BannersManager from "./BannersManager";
import BlogsManager from "./BlogsManager";
import { CategoriesAndBrandsProvider } from "@/contexts/CategoriesAndBrandsContext";

interface AdminDashboardProps {
  user: {
    id: string;
    email?: string;
    role?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

// AdminData interface'ini kaldır, UserPermissions kullanacağız

type ActiveTab =
  | "dashboard"
  | "products"
  | "categories"
  | "brands"
  | "blogs"
  | "banners"
  | "orders";

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userPermissions, setUserPermissions] =
    useState<UserPermissions | null>(null);

  useEffect(() => {
    // Kullanıcının yetki bilgilerini çek
    const fetchUserPermissions = async () => {
      const permissions = await getUserPermissions(user.id);
      setUserPermissions(permissions);
    };

    fetchUserPermissions();
  }, [user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: null,
    },
    {
      id: "products",
      label: "Ürünler",
      icon: Package,
      permission: "products.read",
    },
    {
      id: "orders",
      label: "Siparişler",
      icon: ShoppingCart,
      permission: "orders.read",
    },
    {
      id: "categories",
      label: "Kategoriler",
      icon: FolderOpen,
      permission: "categories.read",
    },
    {
      id: "brands",
      label: "Markalar",
      icon: Building2,
      permission: "brands.read",
    },
    { id: "blogs", label: "Blog", icon: FileText, permission: "blog.read" },
    {
      id: "banners",
      label: "Bannerlar",
      icon: Image,
      permission: "banners.read",
    },
  ];

  // Kullanıcının yetkisi olan menü öğelerini filtrele
  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.permission || !userPermissions) return true;
    return hasPermission(userPermissions, item.permission);
  });

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductsManager />;
      case "orders":
        return <OrdersManager />;
      case "categories":
        return <CategoriesManager />;
      case "brands":
        return <BrandsManager />;
      case "blogs":
        return <BlogsManager />;
      case "banners":
        return <BannersManager />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Admin Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveTab("products")}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Ürünler</h3>
                    <p className="text-gray-600">Ürün yönetimi</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Siparişler</h3>
                    <p className="text-gray-600">Sipariş yönetimi</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <FolderOpen className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Kategoriler</h3>
                    <p className="text-gray-600">Kategori yönetimi</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("brands")}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <Building2 className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Markalar</h3>
                    <p className="text-gray-600">Marka yönetimi</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("blogs")}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Blog</h3>
                    <p className="text-gray-600">Blog yönetimi</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("banners")}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <Image className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Bannerlar</h3>
                    <p className="text-gray-600">Banner yönetimi</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <CategoriesAndBrandsProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="text-xl font-bold">
              <span className="text-blue-600">Oto</span>
              <span className="text-gray-800">CPAP</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="mt-6">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Top Bar */}
          <div className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {visibleMenuItems.find((item) => item.id === activeTab)?.label ||
                "Dashboard"}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hoş geldin, {user.user_metadata?.full_name || user.email}
              </span>
              {userPermissions && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {userPermissions.roleDisplayName}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <main className="flex-1">{renderContent()}</main>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </CategoriesAndBrandsProvider>
  );
}
