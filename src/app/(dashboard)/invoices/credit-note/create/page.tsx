import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { CreateCreditNoteForm } from "./create-credit-note-form";

export default async function CreateCreditNotePage({ searchParams }: { searchParams: Promise<{ linkedInvoiceId?: string }> }) {
  const { organization } = await getTenantSession();
  const { linkedInvoiceId } = await searchParams;

  const [clients, projects, series, templates, linkedInvoice] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: organization.id, deletedAt: null },
      orderBy: { clientName: 'asc' }
    }),
    prisma.project.findMany({
      where: { organizationId: organization.id },
      orderBy: { projectName: 'asc' }
    }),
    prisma.invoiceSeries.findMany({
      where: { organizationId: organization.id, isActive: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.invoiceTemplate.findMany({
      where: { organizationId: organization.id },
      orderBy: { isDefault: 'desc' }
    }),
    linkedInvoiceId
      ? prisma.invoice.findFirst({
          where: { id: linkedInvoiceId, organizationId: organization.id, type: 'INVOICE' },
          include: { client: true, lineItems: true }
        })
      : null,
  ]);

  // Also fetch finalized invoices so user can link to one
  const finalizedInvoices = await prisma.invoice.findMany({
    where: { organizationId: organization.id, type: 'INVOICE', status: 'FINALIZED' },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Credit Note</h1>
        <p className="text-slate-500 mt-1">Issue a credit note independently or against an existing invoice.</p>
      </div>
      <CreateCreditNoteForm
        clients={clients}
        projects={projects}
        series={series}
        templates={templates}
        finalizedInvoices={finalizedInvoices}
        linkedInvoice={linkedInvoice}
      />
    </div>
  );
}
