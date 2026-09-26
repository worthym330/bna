"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

type OrganizationData = {
  id: string;
  legalName: string;
  _count: {
    members: number;
    clients: number;
    invoices: number;
  };
  roles: any[];
  createdAt: string | Date;
};

const columns: ColumnDef<OrganizationData>[] = [
  {
    accessorKey: "legalName",
    header: "Legal Name",
    cell: ({ row }) => <span className="font-medium">{row.getValue("legalName")}</span>
  },
  {
    id: "members",
    header: "Members",
    accessorFn: (row) => row._count.members,
  },
  {
    id: "clients",
    header: "Clients",
    accessorFn: (row) => row._count.clients,
  },
  {
    id: "invoices",
    header: "Invoices",
    accessorFn: (row) => row._count.invoices,
  },
  {
    id: "roles",
    header: "Roles",
    accessorFn: (row) => row.roles.length,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | Date;
      return new Date(date).toLocaleDateString();
    }
  }
];

export function SuperAdminClient({ organizations }: { organizations: OrganizationData[] }) {
  const handleExport = () => {
    const headers = ['Legal Name', 'Members', 'Clients', 'Invoices', 'Roles', 'Created'];
    const csvContent = [
      headers.join(','),
      ...organizations.map(o => [
        `"${o.legalName}"`,
        o._count.members,
        o._count.clients,
        o._count.invoices,
        o.roles.length,
        new Date(o.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'organizations_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DataTable 
      columns={columns} 
      data={organizations} 
      searchKey="legalName" 
      onExport={handleExport}
    />
  );
}
