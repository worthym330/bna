import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InvoicesClient } from "./invoices-client";

export default async function InvoicesPage() {
  const { organization } = await getTenantSession();

  const invoices = await prisma.invoice.findMany({
    where: { organizationId: organization!.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  const invoiceCount = invoices.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">{invoiceCount} invoices</p>
        </div>
        <div className="flex gap-3">
          <Link href="/invoices/create">
            <Button>+ Invoice</Button>
          </Link>
        </div>
      </div>

      <InvoicesClient invoices={invoices} />
    </div>
  );
}
