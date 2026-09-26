import { getTenantSession, requirePermission } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsClient } from "./settings-client";
import { InvoiceSeriesForm } from "./invoice-series-form";

export default async function SettingsPage() {
  const session = await requirePermission("settings.view");
  const { organization } = session;
  const canManage = session.user.isSuperAdmin || session.permissions.includes("settings.manage");

  const googleCreds = await prisma.googleCredential.findUnique({
    where: { organizationId: organization!.id },
  });

  const assets = await prisma.documentAsset.findMany({
    where: { organizationId: organization!.id },
  });

  const invoiceSeries = await prisma.invoiceSeries.findMany({
    where: { organizationId: organization!.id, type: "INVOICE" },
    orderBy: { createdAt: 'desc' }
  });

  const creditNoteSeries = await prisma.invoiceSeries.findMany({
    where: { organizationId: organization!.id, type: "CREDIT_NOTE" },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      <InvoiceSeriesForm existingSeries={invoiceSeries} type="INVOICE" title="Invoice Numbering Series" canManage={canManage} />
      <InvoiceSeriesForm existingSeries={creditNoteSeries} type="CREDIT_NOTE" title="Credit Note Numbering Series" canManage={canManage} />
      
      <SettingsClient 
        isDriveConnected={!!googleCreds} 
        assets={assets} 
        canManage={canManage}
      />
    </div>
  );
}
