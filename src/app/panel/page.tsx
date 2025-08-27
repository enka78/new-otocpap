"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPanel() {
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check current user
    const checkUser = async () => {
      console.log("Panel: Checking user...");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("Panel: Current user:", user?.id);

      if (user) {
        // Basit user_roles tablosundan admin kontrolü yap
        console.log("Panel: Checking admin status for user:", user.id);

        const { data: userRole, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        console.log("Panel: User role query result:", { userRole, roleError });

        if (roleError || !userRole || userRole.role !== "admin") {
          console.log("Panel: User is not admin, redirecting to home");
          // Not admin but logged in, redirect to home
          router.push("/");
          return;
        }

        console.log("Panel: User is admin, setting up panel");
        setUser(user);
        setIsAdmin(true);
      } else {
        console.log("Panel: No user, showing login form");
        // Not logged in, show login form
        setShowLogin(true);
      }

      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        // Basit user_roles tablosundan admin kontrolü yap
        const { data: userRole, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (roleError || !userRole || userRole.role !== "admin") {
          router.push("/");
          return;
        }

        setUser(session.user);
        setIsAdmin(true);
        setShowLogin(false);
      } else {
        setUser(null);
        setIsAdmin(false);
        setShowLogin(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showLogin || (!user && !loading)) {
    return <AdminLogin />;
  }

  if (!user) return null;
  
  return <AdminDashboard user={user} />;
}
