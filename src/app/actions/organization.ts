"use server";

import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { orgProfileSchema } from "@/lib/validations";
import * as z from "zod";

export async function updateOrganizationProfile(data: z.infer<typeof orgProfileSchema>) {
  const { organization } = await getTenantSession();

  if (!organization) {
    throw new Error("Organization not found");
  }

  const parsed = orgProfileSchema.parse(data);

  await prisma.organization.update({
    where: { id: organization!.id },
    data: {
      legalName: parsed.legalName,
      displayName: parsed.displayName,
      email: parsed.email || null,
      phone: parsed.phone || null,
      website: parsed.website || null,
      pan: parsed.pan || null,
      gstin: parsed.gstin || null,
      defaultCurrency: parsed.defaultCurrency || "INR",
      defaultCountry: parsed.defaultCountry || "India",
    },
  });

  revalidatePath("/");
  revalidatePath("/organization");
  return { success: true };
}
