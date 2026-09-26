import { getTenantSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceDetailClient } from "./invoice-detail-client";
import Link from "next/link";

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { organization } = await getTenantSession();

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id, organizationId: organization!.id },
    include: {
      client: true,
      project: true,
      series: true,
      lineItems: true,
    }
  });

  if (!invoice) return notFound();

  const title = `Invoice ${invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : '(Draft)'}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            invoice.status === 'FINALIZED' ? 'bg-green-100 text-green-800' :
            invoice.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600' :
            'bg-amber-100 text-amber-800'
          }`}>
            {invoice.status}
          </span>
        </div>
      </div>

      <InvoiceDetailClient invoice={invoice} />
    </div>
  );
}
