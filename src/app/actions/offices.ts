"use server";
import prisma from "@/lib/prisma";
import { getTenantSession, requirePermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { officeSchema } from "@/lib/validations";
import * as z from "zod";

export async function getOffices() {
  const { organization } = await requirePermission("offices.view");
  return prisma.office.findMany({
    where: { organizationId: organization!.id, deletedAt: null },
    orderBy: { siteName: "asc" },
  });
}

export async function createOffice(data: z.infer<typeof officeSchema>) {
  const { organization } = await requirePermission("offices.manage");
  const parsed = officeSchema.parse(data);
  const office = await prisma.office.create({
    data: {
      ...parsed,
      organizationId: organization!.id,
    },
  });
  revalidatePath("/offices");
  return office;
}

export async function updateOffice(id: string, data: z.infer<typeof officeSchema>) {
  const { organization } = await requirePermission("offices.manage");
  
  const existingOffice = await prisma.office.findUnique({ where: { id } });
  if (!existingOffice || existingOffice.organizationId !== organization!.id) {
    throw new Error("Office not found");
  }

  const parsed = officeSchema.parse(data);

  const office = await prisma.office.update({
    where: { id },
    data: parsed,
  });
  revalidatePath("/offices");
  return office;
}

export async function deleteOffice(id: string) {
  const { organization } = await requirePermission("offices.manage");
  
  const existingOffice = await prisma.office.findUnique({ where: { id } });
  if (!existingOffice || existingOffice.organizationId !== organization!.id) {
    throw new Error("Office not found");
  }

  // Soft delete
  await prisma.office.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  
  revalidatePath("/offices");
  return { success: true };
}
