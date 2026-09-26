import { getTenantSession, requirePermission } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { InvoiceForm } from "@/components/forms/InvoiceForm";

export default async function CreateInvoicePage() {
  const { organization } = await requirePermission("invoices.manage");

  const clients = await prisma.client.findMany({
    where: { organizationId: organization!.id, deletedAt: null },
    orderBy: { clientName: 'asc' }
  });

  const projects = await prisma.project.findMany({
    where: { organizationId: organization!.id, deletedAt: null, status: 'ACTIVE' },
    orderBy: { projectName: 'asc' }
  });

  const series = await prisma.invoiceSeries.findMany({
    where: { organizationId: organization!.id, isActive: true, type: 'INVOICE' },
    orderBy: { name: 'asc' }
  });

  const templates = await prisma.invoiceTemplate.findMany({
    where: { organizationId: organization!.id },
    orderBy: { name: 'asc' }
  });

  const offices = await prisma.office.findMany({
    where: { organizationId: organization!.id, deletedAt: null },
    orderBy: { siteName: 'asc' }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
      </div>

      <InvoiceForm
        mode="create"
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
