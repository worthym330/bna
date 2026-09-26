"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ClientSheet } from "./client-sheet";

import { Client } from "@prisma/client";

type ClientData = Client;

export function ClientsClient({ clients, canManage = true }: { clients: ClientData[], canManage?: boolean }) {
  const columns: ColumnDef<ClientData>[] = [
    {
      accessorKey: "clientName",
      header: "Client Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("clientName")}</span>
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span>{row.getValue("email") || "-"}</span>
    },
    {
      accessorKey: "gstin",
      header: "GSTIN",
      cell: ({ row }) => <span>{row.getValue("gstin") || "-"}</span>
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="text-right">
            {canManage ? <ClientSheet client={client} canManage={canManage} /> : <span className="text-xs text-slate-400">View Only</span>}
          </div>
        );
      }
    }
  ];

  const handleExport = () => {
    const headers = ['Client Name', 'Email', 'GSTIN'];
    const csvContent = [
      headers.join(','),
      ...clients.map(c => [
        `"${c.clientName}"`,
        c.email || '',
        c.gstin || ''
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'clients_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DataTable
      columns={columns}
      data={clients}
      searchKey="clientName"
      onExport={handleExport}
    />
  );
}
