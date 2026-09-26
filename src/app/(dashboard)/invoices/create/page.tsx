import { getTenantSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CreateInvoiceForm } from "./create-invoice-form";

export default async function CreateInvoicePage() {
  const { organization } = await getTenantSession();

  const clients = await prisma.client.findMany({
    where: { organizationId: organization!.id, deletedAt: null },
    orderBy: { clientName: 'asc' }
  });

  const projects = await prisma.project.findMany({
    where: { organizationId: organization!.id, deletedAt: null, status: 'ACTIVE' },
    orderBy: { projectName: 'asc' }
  });

  const series = await prisma.invoiceSeries.findMany({
    where: { organizationId: organization!.id, isActive: true },
    orderBy: { name: 'asc' }
  });

  const templates = await prisma.invoiceTemplate.findMany({
    where: { organizationId: organization!.id },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
      </div>

      <CreateInvoiceForm 
        clients={clients} 
        projects={projects} 
        series={series}
        templates={templates}
        organization={organization}
      />
    </div>
  );
}
