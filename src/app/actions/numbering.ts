"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import * as z from "zod";

const seriesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  prefix: z.string(),
  suffix: z.string(),
  padding: z.coerce.number().min(1).max(10),
});

export async function createInvoiceSeriesAction(formData: FormData) {
  const { organization } = await getTenantSession();
  
  if (!organization) {
    throw new Error("Unauthorized");
  }

  const rawData = {
    name: formData.get("name"),
    prefix: formData.get("prefix") || "",
    suffix: formData.get("suffix") || "",
    padding: formData.get("padding"),
  };

  const parsed = seriesSchema.parse(rawData);

  await prisma.invoiceSeries.create({
    data: {
      organizationId: organization!.id,
      name: parsed.name,
      prefix: parsed.prefix,
      suffix: parsed.suffix,
      padding: parsed.padding,
      currentSequence: 0,
      isActive: true,
    }
  });

  revalidatePath("/settings");
}
