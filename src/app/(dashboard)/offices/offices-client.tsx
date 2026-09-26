"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { OfficeSheet } from "./office-sheet";

import { Office } from "@prisma/client";

type OfficeData = Office;

export function OfficesClient({ offices, canManage = true }: { offices: OfficeData[], canManage?: boolean }) {
  const columns: ColumnDef<OfficeData>[] = [
    {
      accessorKey: "siteName",
      header: "Site Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("siteName")}</span>
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => <span>{row.getValue("city")}</span>
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
        const office = row.original;
        return (
          <div className="text-right">
            {canManage ? <OfficeSheet office={office} canManage={canManage} /> : <span className="text-xs text-slate-400">View Only</span>}
          </div>
        );
      }
    }
  ];

  const handleExport = () => {
    const headers = ['Site Name', 'City', 'GSTIN'];
    const csvContent = [
      headers.join(','),
      ...offices.map(o => [
        `"${o.siteName}"`,
        `"${o.city}"`,
        o.gstin || ''
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'offices_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DataTable
      columns={columns}
      data={offices}
      searchKey="siteName"
      onExport={handleExport}
    />
  );
}
