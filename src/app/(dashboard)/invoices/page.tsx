import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function InvoicesPage() {
  const { organization } = await getTenantSession();

  const invoices = await prisma.invoice.findMany({
    where: { organizationId: organization!.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  const invoiceCount = invoices.filter(i => i.type === 'INVOICE').length;
  const creditNoteCount = invoices.filter(i => i.type === 'CREDIT_NOTE').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices & Credit Notes</h1>
          <p className="text-slate-500 text-sm mt-1">{invoiceCount} invoices · {creditNoteCount} credit notes</p>
        </div>
        <div className="flex gap-3">
          <Link href="/invoices/credit-note/create">
            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              + Credit Note
            </Button>
          </Link>
          <Link href="/invoices/create">
            <Button>+ Invoice</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-500">Type</th>
              <th className="px-6 py-3 font-medium text-slate-500">Number</th>
              <th className="px-6 py-3 font-medium text-slate-500">Client</th>
              <th className="px-6 py-3 font-medium text-slate-500">Date</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-right">Amount</th>
              <th className="px-6 py-3 font-medium text-slate-500">Status</th>
              <th className="px-6 py-3 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No invoices found. Create one to get started!
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    {inv.type === 'CREDIT_NOTE' ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">
                        Credit Note
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                        Invoice
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{inv.invoiceNumber || <span className="text-slate-400 italic">Draft</span>}</td>
                  <td className="px-6 py-4">{inv.client.clientName}</td>
                  <td className="px-6 py-4">{new Date(inv.invoiceDate).toLocaleDateString('en-GB')}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    <span className={inv.type === 'CREDIT_NOTE' ? 'text-red-600' : ''}>
                      {inv.type === 'CREDIT_NOTE' ? '−' : ''}₹{inv.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      inv.status === 'FINALIZED' ? 'bg-green-100 text-green-800' :
                      inv.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/invoices/${inv.id}`} className="text-primary hover:underline">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
