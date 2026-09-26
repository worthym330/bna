"use server";
import prisma from "@/lib/prisma";
import { getTenantSession, requirePermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { clientSchema } from "@/lib/validations";
import * as z from "zod";
import { logAudit } from "@/lib/audit";

export async function getClients() {
  const { organization } = await requirePermission("clients.view");
  return prisma.client.findMany({
    where: { organizationId: organization!.id, deletedAt: null },
    orderBy: { clientName: "asc" },
  });
}

export async function createClient(data: z.infer<typeof clientSchema>) {
  const { organization } = await requirePermission("clients.manage");
  const parsed = clientSchema.parse(data);
  const client = await prisma.client.create({
    data: {
      organizationId: organization!.id,
      clientName: parsed.clientName,
      clientCode: parsed.clientCode || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      gstin: parsed.gstin || null,
      pan: parsed.pan || null,
      addressLine1: parsed.addressLine1 || null,
      addressLine2: parsed.addressLine2 || null,
      city: parsed.city || null,
      state: parsed.state || null,
      country: parsed.country || null,
      pincode: parsed.pincode || null,
    },
  });
  
  await logAudit("CREATE", "Client", client.id, null, client);
  
  revalidatePath("/clients");
  return client;
}

export async function updateClient(id: string, data: z.infer<typeof clientSchema>) {
  const { organization } = await requirePermission("clients.manage");
  
  const existingClient = await prisma.client.findUnique({ where: { id } });
  if (!existingClient || existingClient.organizationId !== organization!.id) {
    throw new Error("Client not found");
  }

  const parsed = clientSchema.parse(data);

  const client = await prisma.client.update({
    where: { id },
    data: {
      clientName: parsed.clientName,
      clientCode: parsed.clientCode || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      gstin: parsed.gstin || null,
      pan: parsed.pan || null,
      addressLine1: parsed.addressLine1 || null,
      addressLine2: parsed.addressLine2 || null,
      city: parsed.city || null,
      state: parsed.state || null,
      country: parsed.country || null,
      pincode: parsed.pincode || null,
    },
  });
  
  await logAudit("UPDATE", "Client", client.id, existingClient, client);
  
  revalidatePath("/clients");
  return client;
}

export async function deleteClient(id: string) {
  const { organization } = await requirePermission("clients.manage");
  
  const existingClient = await prisma.client.findUnique({ where: { id } });
  if (!existingClient || existingClient.organizationId !== organization!.id) {
    throw new Error("Client not found");
  }

  // Soft delete
  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  
  await logAudit("DELETE", "Client", id, existingClient, { deletedAt: new Date() });
  
  revalidatePath("/clients");
  return { success: true };
}
