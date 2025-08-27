"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { User } from "@/types/user";

interface AdminPanelLinkProps {
  user: User;
  isMobile?: boolean;
}

export default function AdminPanelLink({
  user,
  isMobile = false,
}: AdminPanelLinkProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log("AdminPanelLink: No user");
      setLoading(false);
      return;
    }

    console.log("AdminPanelLink: Checking admin status for user:", user.id);

    const checkAdminStatus = async () => {
      try {
        const { data: userRole, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        console.log("AdminPanelLink: User role query result:", {
          userRole,
          error,
        });

        if (error) {
          console.error("AdminPanelLink: Error fetching user role:", error);
          setIsAdmin(false);
        } else {
          const isUserAdmin = userRole?.role === "admin";
          setIsAdmin(isUserAdmin);
          console.log("AdminPanelLink: Is admin:", isUserAdmin);
        }
      } catch (error) {
        console.error("AdminPanelLink: Exception:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading || !isAdmin) return null;

  if (isMobile) {
    return (
      <Link
        href="/panel"
        className="w-full text-left text-blue-600 hover:text-blue-700 transition-colors block"
      >
        Admin Panel
      </Link>
    );
  }

  return (
    <Link
      href="/panel"
      className="text-gray-700 hover:text-blue-600 transition-colors"
      title="Admin Panel"
    >
      <Settings size={20} />
    </Link>
  );
}
