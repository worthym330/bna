import prisma from "./prisma";
import { getNextInvoiceNumber } from "./numbering";
import { getDriveClient, uploadBufferToDrive } from "./drive";
import { generatePdfFromHtml } from "./pdf";
import React from "react";

/**
 * Creates or updates an invoice in DRAFT state.
 */
export async function saveDraftInvoice(data: any, organizationId: string, type: 'INVOICE' | 'CREDIT_NOTE' = 'INVOICE') {
  const { clientId, projectId, seriesId, templateId, invoiceDate, dueDate, notes, terms, lineItems, linkedInvoiceId, reason } = data;
  
  // Calculate totals
  let subTotal = 0;
  let taxTotal = 0;
  
  lineItems.forEach((item: any) => {
    subTotal += item.quantity * item.unitPrice;
    taxTotal += item.taxAmount;
  });

  const totalAmount = subTotal + taxTotal;

  return await prisma.invoice.create({
    data: {
      organizationId,
      clientId,
      projectId: projectId || null,
      seriesId: seriesId || null,
      templateId: templateId || null,
      type,
      status: "DRAFT",
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
      terms,
      linkedInvoiceId: linkedInvoiceId || null,
      reason: reason || null,
      subTotal,
      taxTotal,
      totalAmount,
      lineItems: {
        create: lineItems.map((item: any) => ({
          description: item.description,
          hsnSac: item.hsnSac,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          totalAmount: (item.quantity * item.unitPrice) + item.taxAmount,
        }))
      }
    },
    include: { lineItems: true, client: true, organization: true }
  });
}

/**
 * Finalizes an invoice:
 * 1. Generates permanent invoice number.
 * 2. Generates PDF.
 * 3. Uploads to Google Drive.
 * 4. Locks record.
 */
export async function finalizeInvoice(invoiceId: string, organizationId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, organizationId },
    include: { lineItems: true, client: true, organization: true, series: true, project: true }
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status !== "DRAFT") throw new Error("Invoice is already finalized");
  if (!invoice.seriesId) throw new Error("Invoice series is required for finalization");

  // 1. Generate Number
  const invoiceNumber = await getNextInvoiceNumber(invoice.seriesId, organizationId);

  // 2. Fetch Assets (Letterhead, Signature, Stamp) for PDF
  const assets = await prisma.documentAsset.findMany({
    where: { organizationId }
  });
  
  // We fetch images directly from Drive as Data URIs because Puppeteer
  // cannot easily access our authenticated /api/assets route.
  const getAssetDataUri = async (type: string, specificId?: string) => {
    let asset;
    if (specificId) {
      asset = assets.find(a => a.id === specificId);
    }
    if (!asset) {
      asset = assets.find(a => a.type === type);
    }
    if (asset) {
      const { getDriveFileAsDataUri } = await import('./drive');
      return await getDriveFileAsDataUri(asset.driveFileId, asset.mimeType || '', organizationId);
    }
    return undefined;
  };

  const invoiceData = { ...invoice, invoiceNumber };

  // 3. Generate PDF Stream using HTML Templates
  const defaultTemplateStr = require('./default-template').BHAGYA_TEMPLATE_HTML;
  // In a real app we'd fetch invoice.series.template or default org template.
  // For now, we will use the default template constant unless the org has an InvoiceTemplate.
  
  let htmlContent = defaultTemplateStr;
  let designConfig: any = null;
  
  // If the invoice specifically requested a template, use it.
  // Otherwise, fallback to the organization's default template.
  const templateQuery = invoice.templateId 
    ? { id: invoice.templateId, organizationId }
    : { organizationId, isDefault: true };
    
  const dbTemplate = await prisma.invoiceTemplate.findFirst({
    where: templateQuery
  });
  
  if (dbTemplate) {
    htmlContent = dbTemplate.htmlContent;
    designConfig = dbTemplate.designConfig;
  }

  const pdfBuffer = await generatePdfFromHtml(htmlContent, {
    invoice: invoiceData,
    organization: invoice.organization,
    client: invoice.client,
    project: invoice.project,
    assets: {
      letterhead: await getAssetDataUri("LETTERHEAD", designConfig?.letterheadAssetId),
      signature: await getAssetDataUri("SIGNATURE", designConfig?.signatureAssetId),
      stamp: await getAssetDataUri("STAMP", designConfig?.stampAssetId),
    }
  });

  // 4. Upload to Google Drive
  const driveFileId = await uploadBufferToDrive(
    pdfBuffer,
    `${invoiceNumber.replace(/\//g, '-')}.pdf`,
    "application/pdf",
    organizationId
  );

  // 5. Update Record
  return await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "FINALIZED",
      invoiceNumber,
      driveFileId,
    }
  });
}
