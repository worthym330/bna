"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { AuditLog, User, Organization } from "@prisma/client";

type AuditLogData = AuditLog & {
  user: User | null;
  organization: Organization;
};

const columns: ColumnDef<AuditLogData>[] = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | Date;
      return new Date(date).toLocaleString();
    }
  },
  {
    id: "user",
    header: "User",
    accessorFn: (row) => row.user?.name || row.user?.email || "System",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      const color = action === 'DELETE' ? 'bg-red-100 text-red-800' :
                   action.includes('CREATE') ? 'bg-green-100 text-green-800' :
                   action === 'FINALIZE' ? 'bg-purple-100 text-purple-800' :
                   'bg-blue-100 text-blue-800';
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
          {action}
        </span>
      );
    }
  },
  {
    accessorKey: "entityType",
    header: "Entity",
  },
  {
    accessorKey: "entityId",
    header: "Entity ID",
    cell: ({ row }) => <span className="text-xs font-mono text-slate-500 truncate max-w-[120px] block">{row.getValue("entityId")}</span>
  }
];

export function AuditLogsClient({ logs }: { logs: AuditLogData[] }) {
  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Previous Value', 'New Value'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        `"${log.user?.name || log.user?.email || 'System'}"`,
        log.action,
        log.entityType,
        log.entityId,
        `"${log.previousValue ? JSON.stringify(log.previousValue).replace(/"/g, '""') : ''}"`,
        `"${log.newValue ? JSON.stringify(log.newValue).replace(/"/g, '""') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'audit_logs_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DataTable 
      columns={columns} 
      data={logs} 
      searchKey="action" 
      onExport={handleExport}
    />
  );
}
