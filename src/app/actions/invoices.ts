"use server";

import { revalidatePath } from "next/cache";
import { getTenantSession } from "@/lib/auth";
import { saveDraftInvoice, updateDraftInvoice, finalizeInvoice } from "@/lib/invoice";
import { saveDraftCreditNote, updateDraftCreditNote, finalizeCreditNote } from "@/lib/credit-note";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";

export async function createDraftInvoiceAction(data: any) {
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");
  const invoice = await saveDraftInvoice(data, organization!.id);
  await logAudit("CREATE_DRAFT", "Invoice", invoice.id, null, null);
  revalidatePath("/invoices");
  return { id: invoice.id };
}

export async function createDraftCreditNoteAction(data: any) {
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");
  const creditNote = await saveDraftCreditNote(data, organization!.id);
  await logAudit("CREATE_DRAFT", "CreditNote", creditNote.id, null, null);
  revalidatePath("/credit-notes");
  return { id: creditNote.id };
}

export async function updateDraftInvoiceAction(invoiceId: string, data: any) {
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");
  await updateDraftInvoice(invoiceId, data, organization!.id);
  await logAudit("UPDATE_DRAFT", "Invoice", invoiceId, null, null);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  return { id: invoiceId };
}

export async function finalizeInvoiceAction(invoiceId: string) {
  const { organization } = await getTenantSession();
  
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
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");
  await updateDraftCreditNote(creditNoteId, data, organization!.id);
  await logAudit("UPDATE_DRAFT", "CreditNote", creditNoteId, null, null);
  revalidatePath("/credit-notes");
  revalidatePath(`/credit-notes/${creditNoteId}`);
  return { id: creditNoteId };
}

export async function finalizeCreditNoteAction(creditNoteId: string) {
  const { organization } = await getTenantSession();
  
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
