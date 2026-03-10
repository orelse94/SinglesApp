import { UserRole } from "@prisma/client";

export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

export function canAccessAdmin(role: UserRole): boolean {
  return isAdminRole(role);
}