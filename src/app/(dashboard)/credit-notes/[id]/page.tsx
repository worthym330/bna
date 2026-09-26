import { getTenantSession, requirePermission } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CreditNoteDetailClient } from "./credit-note-detail-client";
import Link from "next/link";

export default async function CreditNoteDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requirePermission("invoices.view");
  const { organization } = session;
  const canManage = session.user.isSuperAdmin || session.permissions.includes("invoices.manage");

  const creditNote = await prisma.creditNote.findUnique({
    where: { id: params.id, organizationId: organization!.id },
    include: {
      client: true,
      project: true,
      series: true,
      lineItems: true,
    }
  });

  if (!creditNote) return notFound();

  // If this is a credit note linked to an invoice, fetch the linked invoice number
  let linkedInvoice = null;
  if (creditNote.linkedInvoiceId) {
    linkedInvoice = await prisma.invoice.findFirst({
      where: { id: creditNote.linkedInvoiceId, organizationId: organization!.id },
      select: { id: true, invoiceNumber: true }
    });
  }

  const title = `Credit Note ${creditNote.creditNoteNumber ? `#${creditNote.creditNoteNumber}` : '(Draft)'}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {linkedInvoice && (
            <p className="text-sm text-slate-500 mt-1">
              Against Invoice:{" "}
              <Link href={`/invoices/${linkedInvoice.id}`} className="text-primary hover:underline font-medium">
                #{linkedInvoice.invoiceNumber}
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            CREDIT NOTE
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            creditNote.status === 'FINALIZED' ? 'bg-green-100 text-green-800' :
            creditNote.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600' :
            'bg-amber-100 text-amber-800'
          }`}>
            {creditNote.status}
          </span>
        </div>
      </div>

      {/* Credit Note Info Banner */}
      {creditNote.reason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 text-sm mb-1">Reason for Credit Note</h3>
          <p className="text-red-700 text-sm">{creditNote.reason}</p>
        </div>
      )}

      <CreditNoteDetailClient creditNote={{ ...creditNote, linkedInvoice }} canManage={canManage} />
    </div>
  );
}
