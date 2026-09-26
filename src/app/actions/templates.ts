"use server";

import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTemplateAction(data: { name: string, htmlContent: string }) {
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");

  // If this is the first template, make it default
  const count = await prisma.invoiceTemplate.count({ where: { organizationId: organization!.id }});
  
  await prisma.invoiceTemplate.create({
    data: {
      organizationId: organization!.id,
      name: data.name,
      htmlContent: data.htmlContent,
      isDefault: count === 0
    }
  });

  revalidatePath("/settings/templates");
  revalidatePath("/invoices/create");
}

export async function updateTemplateAction(id: string, data: { name: string, htmlContent: string }) {
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");

  await prisma.invoiceTemplate.update({
    where: { id, organizationId: organization!.id },
    data
  });

  revalidatePath("/settings/templates");
}

export async function deleteTemplateAction(id: string) {
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");

  await prisma.invoiceTemplate.delete({
    where: { id, organizationId: organization!.id }
  });

  revalidatePath("/settings/templates");
  revalidatePath("/invoices/create");
}

export async function setAsDefaultTemplateAction(id: string) {
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");

  await prisma.$transaction(async (tx) => {
    await tx.invoiceTemplate.updateMany({
      where: { organizationId: organization!.id },
      data: { isDefault: false }
    });
    
    await tx.invoiceTemplate.update({
      where: { id, organizationId: organization!.id },
      data: { isDefault: true }
    });
  });

  revalidatePath("/settings/templates");
}

export async function compilePreviewAction(config: any) {
  const { compileTemplateConfigToHtml } = await import("@/lib/template-compiler");
  const Handlebars = (await import("handlebars")).default;

  if (!Handlebars.helpers.eq) {
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
  }
  if (!Handlebars.helpers.formatDate) {
    Handlebars.registerHelper('formatDate', (d: any) => d || '12/12/2024');
  }
  if (!Handlebars.helpers.formatCurrency) {
    Handlebars.registerHelper('formatCurrency', (v: any) => typeof v === 'number' ? '₹ ' + v.toLocaleString() : v);
  }

  const rawHtml = compileTemplateConfigToHtml(config);
  const template = Handlebars.compile(rawHtml);

  const { organization } = await getTenantSession();
  let assetUrls: any = {};
  
  if (organization) {
    const dbAssets = await prisma.documentAsset.findMany({
      where: { organizationId: organization!.id }
    });
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4321";
    const getAssetUrl = (type: string, specificId?: string) => {
      if (specificId) {
        const asset = dbAssets.find(a => a.id === specificId);
        if (asset) return `${baseUrl}/api/assets/${asset.id}`;
      }
      const asset = dbAssets.find(a => a.type === type);
      return asset ? `${baseUrl}/api/assets/${asset.id}` : undefined;
    };

    assetUrls = {
      letterhead: getAssetUrl("LETTERHEAD", config.letterheadAssetId),
      signature: getAssetUrl("SIGNATURE", config.signatureAssetId),
      stamp: getAssetUrl("STAMP", config.stampAssetId),
    };
  }

  return template({
    invoice: {
      type: "INVOICE", 
      status: "FINALIZED",
      invoiceNumber: "INV-2024-001",
      invoiceDate: "2024-12-12",
      subTotal: 10000,
      taxTotal: 1800,
      totalAmount: 11800,
      lineItems: [
        { description: "Consulting Services", hsnSac: "9983", quantity: 1, unitPrice: 5000, totalAmount: 5000 },
        { description: "Development", hsnSac: "9983", quantity: 1, unitPrice: 5000, totalAmount: 5000 }
      ]
    },
    organization: {
      legalName: "Your Company Ltd",
      gstin: "22AAAAA0000A1Z5",
      pan: "AAAAA0000A",
      address: "123 Tech Park, Sector 4",
      city: "Mumbai",
      pincode: "400001"
    },
    client: {
      clientName: "Acme Corp",
      addressLine1: "456 Business Road",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      gstin: "33BBBBB0000B1Z5",
      pan: "BBBBB0000B"
    },
    project: {
      projectName: "Website Redesign",
      workOrderNumber: "WO-999",
      workOrderDate: "2024-12-01"
    },
    assets: assetUrls
  });
}
