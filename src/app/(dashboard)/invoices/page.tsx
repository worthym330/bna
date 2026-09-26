import prisma from "@/lib/prisma";
import { getTenantSession, requirePermission } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InvoicesClient } from "./invoices-client";

export default async function InvoicesPage() {
  const session = await requirePermission("invoices.view");
  const { organization } = session;
  const canManage = session.user.isSuperAdmin || session.permissions.includes("invoices.manage");

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
        {canManage && (
          <div className="flex gap-3">
            <Link href="/invoices/create">
              <Button>+ Invoice</Button>
            </Link>
          </div>
        )}
      </div>

      <InvoicesClient invoices={invoices} canManage={canManage} />
    </div>
  );
}
