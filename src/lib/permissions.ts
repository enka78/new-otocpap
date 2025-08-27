import { supabase } from "./supabase";
import { Permission } from "@/types/permission";

interface PermissionData {
  id: number;
  name: string;
  display_name: string;
  module: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Basit rol ve yetki sistemi
export interface UserPermissions {
  userId: string;
  roleId: number;
  roleName: string;
  roleDisplayName: string;
  permissions: string[];
}

// Kullanıcının yetkilerini basit user_roles tablosundan çek
export async function getUserPermissions(
  userId: string
): Promise<UserPermissions | null> {
  try {
    // Basit user_roles tablosundan kullanıcının rolünü çek
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError || !userRole) {
      console.log("User role not found:", roleError);
      return null;
    }

    // Admin değilse null döndür
    if (userRole.role !== "admin") {
      return null;
    }

    // Admin için tüm yetkiler
    const adminPermissions = [
      "products.read",
      "products.create", 
      "products.update",
      "products.delete",
      "categories.read",
      "categories.create",
      "categories.update", 
      "categories.delete",
      "brands.read",
      "brands.create",
      "brands.update",
      "brands.delete",
      "orders.read",
      "orders.update",
      "blog.read",
      "blog.create",
      "banners.read",
      "banners.create"
    ];

    return {
      userId: userId,
      roleId: 1, // Admin role ID
      roleName: "admin",
      roleDisplayName: "Yönetici",
      permissions: adminPermissions,
    };
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return null;
  }
}

// Yetki kontrol fonksiyonu
export function hasPermission(
  userPermissions: UserPermissions | null,
  permission: string
): boolean {
  if (!userPermissions) return false;
  return userPermissions.permissions.includes(permission);
}

// Tüm rolleri getir
export async function getAllRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("is_active", true)
    .order("display_name");

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }

  return data || [];
}

// Tüm yetkileri getir
export async function getAllPermissions() {
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq("is_active", true)
    .order("module", { ascending: true });

  if (error) {
    console.error("Error fetching permissions:", error);
    return [];
  }

  return data || [];
}

// Rol yetkilerini getir
export async function getRolePermissions(roleId: number) {
  const { data, error } = await supabase
    .from("role_permissions")
    .select(
      `
      permissions!inner (
        id,
        name,
        display_name,
        module,
        is_active
      )
    `
    )
    .eq("role_id", roleId)
    .eq("permissions.is_active", true);

  if (error) {
    console.error("Error fetching role permissions:", error);
    return [];
  }

  return data?.map((rp: any) => ({
    id: rp.permissions.id,
    name: rp.permissions.name,
    description: rp.permissions.display_name,
    created_at: rp.permissions.created_at,
    updated_at: rp.permissions.updated_at
  } as Permission)) || [];
}

// Rol yetki ataması yap
export async function assignPermissionToRole(
  roleId: number,
  permissionId: number
) {
  const { error } = await supabase
    .from("role_permissions")
    .insert([{ role_id: roleId, permission_id: permissionId }]);

  if (error) {
    console.error("Error assigning permission to role:", error);
    return false;
  }

  return true;
}

// Rol yetki atamasını kaldır
export async function removePermissionFromRole(
  roleId: number,
  permissionId: number
) {
  const { error } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId)
    .eq("permission_id", permissionId);

  if (error) {
    console.error("Error removing permission from role:", error);
    return false;
  }

  return true;
}
