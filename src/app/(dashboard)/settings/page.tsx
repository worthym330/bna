import { getTenantSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsClient } from "./settings-client";
import { InvoiceSeriesForm } from "./invoice-series-form";

export default async function SettingsPage() {
  const { organization } = await getTenantSession();

  const googleCreds = await prisma.googleCredential.findUnique({
    where: { organizationId: organization!.id },
  });

  const assets = await prisma.documentAsset.findMany({
    where: { organizationId: organization!.id },
  });

  const invoiceSeries = await prisma.invoiceSeries.findMany({
    where: { organizationId: organization!.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      <InvoiceSeriesForm existingSeries={invoiceSeries} />
      
      <SettingsClient 
        isDriveConnected={!!googleCreds} 
        assets={assets} 
      />
    </div>
  );
}
