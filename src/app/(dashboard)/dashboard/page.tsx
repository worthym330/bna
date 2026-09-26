import { getTenantSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const { user, organization } = await getTenantSession();

  if (user.isSuperAdmin) {
    redirect("/super-admin");
  }
  
  if (!organization) {
    return <div>No organization selected</div>;
  }

  const [totalClients, totalProjects, totalInvoices, invoiceAggregate, recentInvoices] = await Promise.all([
    prisma.client.count({ where: { organizationId: organization.id } }),
    prisma.project.count({ where: { organizationId: organization.id } }),
    prisma.invoice.count({ where: { organizationId: organization.id, status: 'FINALIZED' } }),
    prisma.invoice.aggregate({
      where: { organizationId: organization.id, status: 'FINALIZED' },
      _sum: { totalAmount: true }
    }),
    prisma.invoice.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { client: true }
    })
  ]);

  const stats = {
    totalClients,
    totalProjects,
    totalInvoices,
    totalInvoiceAmount: invoiceAggregate?._sum?.totalAmount || 0,
    recentInvoices,
  };

  return <DashboardClient organizationName={organization.legalName} stats={stats} />;
}
