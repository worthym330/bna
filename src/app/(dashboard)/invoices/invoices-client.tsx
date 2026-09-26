"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

type InvoiceData = {
  id: string;
  invoiceNumber: string | null;
  client: { clientName: string };
  invoiceDate: string | Date;
  totalAmount: number;
  status: string;
};

const columns: ColumnDef<InvoiceData>[] = [

  {
    accessorKey: "invoiceNumber",
    header: "Number",
    cell: ({ row }) => {
      const num = row.getValue("invoiceNumber") as string | null;
      return <span className="font-medium">{num || <span className="text-slate-400 italic">Draft</span>}</span>;
    }
  },
  {
    id: "clientName",
    accessorFn: (row) => row.client.clientName,
    header: "Client",
  },
  {
    accessorKey: "invoiceDate",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("invoiceDate") as string | Date;
      return new Date(date).toLocaleDateString('en-GB');
    }
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      return (
        <div className="text-right font-medium">
          {formatCurrency(amount)}
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          status === 'FINALIZED' ? 'bg-green-100 text-green-800' :
          status === 'CANCELLED' ? 'bg-slate-100 text-slate-600' :
          'bg-amber-100 text-amber-800'
        }`}>
          {status}
        </span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="text-right">
          <Link href={`/invoices/${invoice.id}`} className="text-primary hover:underline font-medium">
            View
          </Link>
        </div>
      );
    }
  }
];

export function InvoicesClient({ invoices, canManage }: { invoices: InvoiceData[]; canManage?: boolean }) {
  const handleExport = () => {
    // Generate CSV
    const headers = ['Number', 'Client', 'Date', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...invoices.map(inv => [
        inv.invoiceNumber || 'Draft',
        `"${inv.client.clientName}"`,
        new Date(inv.invoiceDate).toLocaleDateString('en-GB'),
        inv.totalAmount,
        inv.status
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'invoices_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DataTable 
      columns={columns} 
      data={invoices} 
      searchKey="clientName" 
      onExport={handleExport}
    />
  );
}
