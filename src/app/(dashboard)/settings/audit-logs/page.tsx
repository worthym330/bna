import { getTenantSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AuditLogsClient } from "./audit-logs-client";

export default async function AuditLogsPage() {
  const { organization, user } = await getTenantSession();

  let auditLogs;

  if (user.isSuperAdmin) {
    auditLogs = await prisma.auditLog.findMany({
      include: { user: true, organization: true },
      orderBy: { createdAt: 'desc' },
      take: 1000
    });
  } else {
    auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: organization!.id },
      include: { user: true, organization: true },
      orderBy: { createdAt: 'desc' },
      take: 500
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
      </div>
      <p className="text-slate-500 text-sm">
        Review recent activity and changes across the system.
      </p>

      <div className="rounded-md border bg-white p-6">
        <AuditLogsClient logs={auditLogs as any} />
      </div>
    </div>
  );
}
