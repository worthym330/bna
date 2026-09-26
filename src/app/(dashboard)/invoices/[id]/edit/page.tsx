import prisma from "@/lib/prisma";
import { getTenantSession, requirePermission } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { InvoiceForm } from "@/components/forms/InvoiceForm";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requirePermission("invoices.manage");
  const { id } = await params;

  if (!organization) return redirect("/login");

  const invoice = await prisma.invoice.findUnique({
    where: { id, organizationId: organization.id },
    include: { lineItems: true }
  });

  if (!invoice) return notFound();
  if (invoice.status !== "DRAFT") {
    // Only draft invoices can be edited
    return redirect(`/invoices/${id}`);
  }

  const [clients, projects, series, templates, offices] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: organization.id, deletedAt: null },
      orderBy: { clientName: 'asc' }
    }),
    prisma.project.findMany({
      where: { organizationId: organization.id },
      orderBy: { projectName: 'asc' }
    }),
    prisma.invoiceSeries.findMany({
      where: { organizationId: organization.id, isActive: true, type: 'INVOICE' },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.invoiceTemplate.findMany({
      where: { organizationId: organization.id },
      orderBy: { isDefault: 'desc' }
    }),
    prisma.office.findMany({
      where: { organizationId: organization.id, deletedAt: null },
      orderBy: { siteName: 'asc' }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Draft Invoice</h1>
        <p className="text-slate-500 mt-1">Make changes to your draft invoice.</p>
      </div>
      <InvoiceForm
        mode="edit"
        invoice={invoice}
        clients={clients}
        projects={projects}
        series={series}
        templates={templates}
        offices={offices}
        organization={organization}
      />
    </div>
  );
}
