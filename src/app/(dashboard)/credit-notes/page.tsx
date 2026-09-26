import prisma from "@/lib/prisma";
import { getTenantSession, requirePermission } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditNotesClient } from "./credit-notes-client";

export default async function CreditNotesPage() {
  const session = await requirePermission("invoices.view");
  const { organization } = session;
  const canManage = session.user.isSuperAdmin || session.permissions.includes("invoices.manage");

  const creditNotes = await prisma.creditNote.findMany({
    where: { organizationId: organization!.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  const creditNoteCount = creditNotes.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
          <p className="text-slate-500 text-sm mt-1">{creditNoteCount} credit notes</p>
        </div>
        {canManage && (
          <div className="flex gap-3">
            <Link href="/credit-notes/create">
              <Button className="bg-red-600 hover:bg-red-700 text-white">+ Credit Note</Button>
            </Link>
          </div>
        )}
      </div>

      <CreditNotesClient creditNotes={creditNotes} canManage={canManage} />
    </div>
  );
}
