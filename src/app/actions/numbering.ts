"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getTenantSession, requirePermission } from "@/lib/auth";
import * as z from "zod";

const seriesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INVOICE", "CREDIT_NOTE"]).default("INVOICE"),
  prefix: z.string(),
  suffix: z.string(),
  padding: z.coerce.number().min(1).max(10),
  startSequence: z.coerce.number().min(1).default(1),
});

export async function createInvoiceSeriesAction(formData: FormData) {
  const { organization } = await requirePermission("settings.manage");
  
  if (!organization) {
    throw new Error("Unauthorized");
  }

  const rawData = {
    name: formData.get("name"),
    type: formData.get("type") || "INVOICE",
    prefix: formData.get("prefix") || "",
    suffix: formData.get("suffix") || "",
    padding: formData.get("padding"),
    startSequence: formData.get("startSequence") || 1,
  };

  const parsed = seriesSchema.parse(rawData);

  await prisma.invoiceSeries.create({
    data: {
      organizationId: organization!.id,
      name: parsed.name,
      type: parsed.type,
      prefix: parsed.prefix,
      suffix: parsed.suffix,
      padding: parsed.padding,
      currentSequence: parsed.startSequence - 1,
      isActive: true,
    }
  });

  revalidatePath("/settings");
}

export async function updateInvoiceSeriesAction(id: string, data: {
  name: string;
  prefix: string;
  suffix: string;
  padding: number;
  isActive: boolean;
}) {
  const { organization } = await requirePermission("settings.manage");
  if (!organization) throw new Error("Unauthorized");

  await prisma.invoiceSeries.update({
    where: { id, organizationId: organization!.id },
    data: {
      name: data.name,
      prefix: data.prefix,
      suffix: data.suffix,
      padding: data.padding,
      isActive: data.isActive,
    }
  });

  revalidatePath("/settings");
}

export async function deleteInvoiceSeriesAction(id: string) {
  const { organization } = await requirePermission("settings.manage");
  if (!organization) throw new Error("Unauthorized");

  // Only allow delete if no invoices have used this series
  const [invoiceCount, creditNoteCount] = await Promise.all([
    prisma.invoice.count({ where: { seriesId: id } }),
    prisma.creditNote.count({ where: { seriesId: id } })
  ]);
  
  if (invoiceCount > 0 || creditNoteCount > 0) {
    throw new Error(`Cannot delete: This series is in use.`);
  }

  await prisma.invoiceSeries.delete({ where: { id, organizationId: organization!.id } });
  revalidatePath("/settings");
}
