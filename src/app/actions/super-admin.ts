"use server";

import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ─── Organization Actions ───────────────────────────────────────────────────

export async function createOrganizationAction(data: {
  legalName: string;
  displayName: string;
  email?: string;
  gstin?: string;
  pan?: string;
}) {
  const { user } = await getTenantSession();
  if (!user.isSuperAdmin) throw new Error("Unauthorized");
  await prisma.organization.create({ data });
  revalidatePath("/super-admin");
}

// ─── User Actions ──────────────────────────────────────────────────────────

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  organizationId: string;
  roleId?: string;
}) {
  const { user } = await getTenantSession();
  if (!user.isSuperAdmin) throw new Error("Unauthorized");

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already in use.");

  const hash = await bcrypt.hash(data.password, 10);
  const newUser = await prisma.user.create({
    data: { email: data.email, name: data.name, passwordHash: hash }
  });

  await prisma.organizationMember.create({
    data: {
      userId: newUser.id,
      organizationId: data.organizationId,
      roleId: data.roleId || null,
    }
  });

  revalidatePath("/super-admin");
}

// ─── Role Actions ──────────────────────────────────────────────────────────

export async function createRoleAction(data: {
  organizationId: string;
  name: string;
  description?: string;
  permissionIds: string[];
}) {
  const { user } = await getTenantSession();
  if (!user.isSuperAdmin) throw new Error("Unauthorized");

  const role = await prisma.role.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      description: data.description,
      permissions: {
        create: data.permissionIds.map(permissionId => ({ permissionId }))
      }
    }
  });

  revalidatePath("/super-admin");
  return role;
}

export async function updateRolePermissionsAction(roleId: string, permissionIds: string[]) {
  const { user } = await getTenantSession();
  if (!user.isSuperAdmin) throw new Error("Unauthorized");

  // Delete all existing then recreate
  await prisma.rolePermission.deleteMany({ where: { roleId } });
  await prisma.rolePermission.createMany({
    data: permissionIds.map(permissionId => ({ roleId, permissionId }))
  });

  revalidatePath("/super-admin");
}

export async function deleteRoleAction(roleId: string) {
  const { user } = await getTenantSession();
  if (!user.isSuperAdmin) throw new Error("Unauthorized");
  await prisma.role.delete({ where: { id: roleId } });
  revalidatePath("/super-admin");
}

export async function assignRoleToMemberAction(memberId: string, roleId: string | null) {
  const { user } = await getTenantSession();
  if (!user.isSuperAdmin) throw new Error("Unauthorized");
  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { roleId }
  });
  revalidatePath("/super-admin");
}
