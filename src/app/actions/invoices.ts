"use server";

import { revalidatePath } from "next/cache";
import { getTenantSession, requirePermission } from "@/lib/auth";
import { saveDraftInvoice, updateDraftInvoice, finalizeInvoice } from "@/lib/invoice";
import { saveDraftCreditNote, updateDraftCreditNote, finalizeCreditNote } from "@/lib/credit-note";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";

export async function createDraftInvoiceAction(data: any) {
  const { organization } = await requirePermission("invoices.manage");
  if (!organization) throw new Error("Unauthorized");
  const invoice = await saveDraftInvoice(data, organization!.id);
  await logAudit("CREATE_DRAFT", "Invoice", invoice.id, null, null);
  revalidatePath("/invoices");
  return { id: invoice.id };
}

export async function createDraftCreditNoteAction(data: any) {
  const { organization } = await requirePermission("invoices.manage");
  if (!organization) throw new Error("Unauthorized");
  const creditNote = await saveDraftCreditNote(data, organization!.id);
  await logAudit("CREATE_DRAFT", "CreditNote", creditNote.id, null, null);
  revalidatePath("/credit-notes");
  return { id: creditNote.id };
}

export async function updateDraftInvoiceAction(invoiceId: string, data: any) {
  const { organization } = await requirePermission("invoices.manage");
  if (!organization) throw new Error("Unauthorized");
  await updateDraftInvoice(invoiceId, data, organization!.id);
  await logAudit("UPDATE_DRAFT", "Invoice", invoiceId, null, null);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  return { id: invoiceId };
}

export async function finalizeInvoiceAction(invoiceId: string) {
  const { organization } = await requirePermission("invoices.manage");
  
  if (!organization) throw new Error("Unauthorized");

  try {
    await finalizeInvoice(invoiceId, organization!.id);
    await logAudit("FINALIZE", "Invoice", invoiceId, { status: "DRAFT" }, { status: "FINALIZED" });
  } catch (err: any) {
    // Return error as a structured object so the client can show it as a toast
    // instead of crashing the page with a Next.js error boundary
    return { error: err?.message || "Failed to finalize invoice. Please try again." };
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}

export async function updateDraftCreditNoteAction(creditNoteId: string, data: any) {
  const { organization } = await requirePermission("invoices.manage");
  if (!organization) throw new Error("Unauthorized");
  await updateDraftCreditNote(creditNoteId, data, organization!.id);
  await logAudit("UPDATE_DRAFT", "CreditNote", creditNoteId, null, null);
  revalidatePath("/credit-notes");
  revalidatePath(`/credit-notes/${creditNoteId}`);
  return { id: creditNoteId };
}

export async function finalizeCreditNoteAction(creditNoteId: string) {
  const { organization } = await requirePermission("invoices.manage");
  
  if (!organization) throw new Error("Unauthorized");

  try {
    await finalizeCreditNote(creditNoteId, organization!.id);
    await logAudit("FINALIZE", "CreditNote", creditNoteId, { status: "DRAFT" }, { status: "FINALIZED" });
  } catch (err: any) {
    return { error: err?.message || "Failed to finalize credit note. Please try again." };
  }

  revalidatePath("/credit-notes");
  revalidatePath(`/credit-notes/${creditNoteId}`);
  return { success: true };
}

export async function deleteDraftInvoiceAction(invoiceId: string) {
  const { organization } = await requirePermission("invoices.manage");
  if (!organization) throw new Error("Unauthorized");

  const prisma = (await import("@/lib/prisma")).default;
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: organization!.id, status: "DRAFT" }
  });
  if (!invoice) throw new Error("Invoice not found or not a draft");

  await prisma.invoice.delete({ where: { id: invoiceId } });
  await logAudit("DELETE", "Invoice", invoiceId, null, null);
  revalidatePath("/invoices");
}

export async function cancelInvoiceAction(invoiceId: string) {
  const { organization } = await requirePermission("invoices.manage");
  if (!organization) throw new Error("Unauthorized");

  const prisma = (await import("@/lib/prisma")).default;
  await prisma.invoice.update({
    where: { id: invoiceId, organizationId: organization!.id },
    data: { status: "CANCELLED" }
  });
  await logAudit("CANCEL", "Invoice", invoiceId, { status: "FINALIZED" }, { status: "CANCELLED" });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteDraftCreditNoteAction(creditNoteId: string) {
  const { organization } = await requirePermission("invoices.manage");
  if (!organization) throw new Error("Unauthorized");

  const prisma = (await import("@/lib/prisma")).default;
  const cn = await prisma.creditNote.findFirst({
    where: { id: creditNoteId, organizationId: organization!.id, status: "DRAFT" }
  });
  if (!cn) throw new Error("Credit note not found or not a draft");

  await prisma.creditNote.delete({ where: { id: creditNoteId } });
  await logAudit("DELETE", "CreditNote", creditNoteId, null, null);
  revalidatePath("/credit-notes");
}

export async function cancelCreditNoteAction(creditNoteId: string) {
  const { organization } = await requirePermission("invoices.manage");
  if (!organization) throw new Error("Unauthorized");

  const prisma = (await import("@/lib/prisma")).default;
  await prisma.creditNote.update({
    where: { id: creditNoteId, organizationId: organization!.id },
    data: { status: "CANCELLED" }
  });
  await logAudit("CANCEL", "CreditNote", creditNoteId, { status: "FINALIZED" }, { status: "CANCELLED" });
  revalidatePath("/credit-notes");
  revalidatePath(`/credit-notes/${creditNoteId}`);
}
