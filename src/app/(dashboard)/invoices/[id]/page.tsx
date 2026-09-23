import { getTenantSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceDetailClient } from "./invoice-detail-client";
import Link from "next/link";

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { organization } = await getTenantSession();

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id, organizationId: organization.id },
    include: {
      client: true,
      project: true,
      series: true,
      lineItems: true,
    }
  });

  if (!invoice) return notFound();

  // If this is a credit note linked to an invoice, fetch the linked invoice number
  let linkedInvoice = null;
  if (invoice.linkedInvoiceId) {
    linkedInvoice = await prisma.invoice.findFirst({
      where: { id: invoice.linkedInvoiceId, organizationId: organization.id },
      select: { id: true, invoiceNumber: true }
    });
  }

  const isCreditNote = invoice.type === 'CREDIT_NOTE';
  const title = isCreditNote
    ? `Credit Note ${invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : '(Draft)'}`
    : `Invoice ${invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : '(Draft)'}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {isCreditNote && linkedInvoice && (
            <p className="text-sm text-slate-500 mt-1">
              Against Invoice:{" "}
              <Link href={`/invoices/${linkedInvoice.id}`} className="text-primary hover:underline font-medium">
                #{linkedInvoice.invoiceNumber}
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isCreditNote && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
              CREDIT NOTE
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            invoice.status === 'FINALIZED' ? 'bg-green-100 text-green-800' :
            invoice.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600' :
            'bg-amber-100 text-amber-800'
          }`}>
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Credit Note Info Banner */}
      {isCreditNote && (invoice as any).reason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 text-sm mb-1">Reason for Credit Note</h3>
          <p className="text-red-700 text-sm">{(invoice as any).reason}</p>
        </div>
      )}

      <InvoiceDetailClient invoice={{ ...invoice, linkedInvoice }} />
    </div>
  );
}
