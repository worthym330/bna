"use server";

import { revalidatePath } from "next/cache";
import { getTenantSession } from "@/lib/auth";
import { saveDraftInvoice, finalizeInvoice } from "@/lib/invoice";
import { redirect } from "next/navigation";

export async function createDraftInvoiceAction(data: any) {
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");
  const invoice = await saveDraftInvoice(data, organization!.id, 'INVOICE');
  revalidatePath("/invoices");
  return { id: invoice.id };
}

export async function createDraftCreditNoteAction(data: any) {
  const { organization } = await getTenantSession();
  if (!organization) throw new Error("Unauthorized");
  const creditNote = await saveDraftInvoice(data, organization!.id, 'CREDIT_NOTE');
  revalidatePath("/invoices");
  return { id: creditNote.id };
}

export async function finalizeInvoiceAction(invoiceId: string) {
  const { organization } = await getTenantSession();
  
  if (!organization) throw new Error("Unauthorized");

  try {
    await finalizeInvoice(invoiceId, organization!.id);
  } catch (err: any) {
    // Return error as a structured object so the client can show it as a toast
    // instead of crashing the page with a Next.js error boundary
    return { error: err?.message || "Failed to finalize invoice. Please try again." };
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}
