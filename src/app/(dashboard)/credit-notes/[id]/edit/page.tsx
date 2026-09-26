import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { CreditNoteForm } from "@/components/forms/CreditNoteForm";

export default async function EditCreditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await getTenantSession();
  const { id } = await params;

  if (!organization) return redirect("/login");

  const creditNote = await prisma.creditNote.findUnique({
    where: { id, organizationId: organization.id },
    include: { lineItems: true }
  });

  if (!creditNote) return notFound();
  if (creditNote.status !== "DRAFT") {
    // Only draft credit notes can be edited
    return redirect(`/credit-notes/${id}`);
  }

  const [clients, projects, series, templates, offices, finalizedInvoices] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: organization.id, deletedAt: null },
      orderBy: { clientName: 'asc' }
    }),
    prisma.project.findMany({
      where: { organizationId: organization.id },
      orderBy: { projectName: 'asc' }
    }),
    prisma.invoiceSeries.findMany({
      where: { organizationId: organization.id, isActive: true, type: 'CREDIT_NOTE' },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.invoiceTemplate.findMany({
      where: { organizationId: organization.id },
      orderBy: { isDefault: 'desc' }
    }),
    prisma.office.findMany({
      where: { organizationId: organization.id, deletedAt: null },
      orderBy: { siteName: 'asc' }
    }),
    prisma.invoice.findMany({
      where: { organizationId: organization.id, status: 'FINALIZED' },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Draft Credit Note</h1>
        <p className="text-slate-500 mt-1">Make changes to your draft credit note.</p>
      </div>
      <CreditNoteForm
        mode="edit"
        creditNote={creditNote}
        clients={clients}
        projects={projects}
        series={series}
        templates={templates}
        offices={offices}
        finalizedInvoices={finalizedInvoices}
        organization={organization}
      />
    </div>
  );
}
