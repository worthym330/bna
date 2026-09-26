import prisma from "./prisma";
import { getNextInvoiceNumber } from "./numbering"; // We might need a separate credit note numbering
import { getDriveClient, uploadBufferToDrive } from "./drive";
import { generatePdfFromHtml } from "./pdf";
import React from "react";

/**
 * Creates or updates a credit note in DRAFT state.
 */
export async function saveDraftCreditNote(data: any, organizationId: string) {
  const { clientId, officeId, projectId, seriesId, templateId, creditNoteDate, notes, terms, lineItems, linkedInvoiceId, reason, taxType } = data;
  
  // Calculate totals
  let subTotal = 0;
  let taxTotal = 0;
  
  lineItems.forEach((item: any) => {
    subTotal += item.quantity * item.unitPrice;
    taxTotal += item.taxAmount;
  });

  const totalAmount = subTotal + taxTotal;

  return await prisma.creditNote.create({
    data: {
      organizationId,
      clientId,
      officeId,
      projectId: projectId || null,
      seriesId: seriesId || null,
      templateId: templateId || null,
      status: "DRAFT",
      creditNoteDate: new Date(creditNoteDate),
      notes,
      terms,
      linkedInvoiceId,
      reason,
      subTotal,
      taxTotal,
      totalAmount,
      taxType: taxType || "CGST_SGST",
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
 * Updates an existing credit note in DRAFT state.
 */
export async function updateDraftCreditNote(creditNoteId: string, data: any, organizationId: string) {
  const creditNote = await prisma.creditNote.findUnique({
    where: { id: creditNoteId, organizationId }
  });

  if (!creditNote) throw new Error("Credit Note not found");
  if (creditNote.status !== "DRAFT") throw new Error("Only draft credit notes can be edited");

  const { clientId, officeId, projectId, seriesId, templateId, creditNoteDate, notes, terms, lineItems, linkedInvoiceId, reason, taxType } = data;
  
  // Calculate totals
  let subTotal = 0;
  let taxTotal = 0;
  
  lineItems.forEach((item: any) => {
    subTotal += item.quantity * item.unitPrice;
    taxTotal += item.taxAmount;
  });

  const totalAmount = subTotal + taxTotal;

  // First delete existing line items
  await prisma.creditNoteLineItem.deleteMany({
    where: { creditNoteId }
  });

  return await prisma.creditNote.update({
    where: { id: creditNoteId },
    data: {
      clientId,
      officeId,
      projectId: projectId || null,
      seriesId: seriesId || null,
      templateId: templateId || null,
      creditNoteDate: new Date(creditNoteDate),
      notes,
      terms,
      linkedInvoiceId,
      reason,
      subTotal,
      taxTotal,
      totalAmount,
      taxType: taxType || "CGST_SGST",
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
 * Finalizes a credit note
 */
export async function finalizeCreditNote(creditNoteId: string, organizationId: string) {
  const creditNote = await prisma.creditNote.findUnique({
    where: { id: creditNoteId, organizationId },
    include: { lineItems: true, client: true, organization: true, series: true, project: true }
  });

  if (!creditNote) throw new Error("Credit Note not found");
  if (creditNote.status !== "DRAFT") throw new Error("Credit Note is already finalized");
  if (!creditNote.seriesId) throw new Error("Series is required for finalization");

  // Re-use logic or create similar logic for credit note number...
  // For now using invoice number generation logic as placeholder
  const creditNoteNumber = await getNextInvoiceNumber(creditNote.seriesId, organizationId);

  // ... PDF Generation omitted for brevity ...
  const driveFileId = "placeholder_drive_file_id";

  return await prisma.creditNote.update({
    where: { id: creditNoteId },
    data: {
      status: "FINALIZED",
      creditNoteNumber,
      driveFileId,
    }
  });
}
