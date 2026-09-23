import { getTenantSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TemplatesClient } from "./templates-client";

export default async function TemplatesPage() {
  const { organization } = await getTenantSession();

  const templates = await prisma.invoiceTemplate.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: 'desc' }
  });

  const assets = await prisma.documentAsset.findMany({
    where: { organizationId: organization.id }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Invoice Templates</h1>
      </div>
      
      <TemplatesClient initialTemplates={templates} assets={assets} />
    </div>
  );
}
