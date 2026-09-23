"use server";

import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { createOrgSchema, createUserSchema } from "@/lib/validations";
import * as z from "zod";

export async function createOrganizationAction(data: z.infer<typeof createOrgSchema>) {
  const { user } = await getTenantSession();
  if (!user.isSuperAdmin) {
    throw new Error("Unauthorized");
  }

  const parsed = createOrgSchema.parse(data);

  await prisma.organization.create({
    data: {
      legalName: parsed.legalName,
      displayName: parsed.displayName,
    }
  });

  revalidatePath("/super-admin");
  return { success: true };
}

export async function createUserAction(data: z.infer<typeof createUserSchema>) {
  const { user } = await getTenantSession();
  if (!user.isSuperAdmin) {
    throw new Error("Unauthorized");
  }

  const parsed = createUserSchema.parse(data);

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);
  
  await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email: parsed.email, name: parsed.name, passwordHash, isSuperAdmin: false }
    });

    let adminRole = await tx.role.findFirst({
      where: { name: 'ADMIN', organizationId: null }
    });

    if (!adminRole) {
      adminRole = await tx.role.create({
        data: { name: 'ADMIN', description: 'System Administrator' }
      });
    }

    await tx.organizationMember.create({
      data: {
        userId: newUser.id,
        organizationId: parsed.organizationId,
        roleId: adminRole.id
      }
    });
  });

  revalidatePath("/super-admin");
  return { success: true };
}
