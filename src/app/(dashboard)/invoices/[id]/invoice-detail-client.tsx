"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { finalizeInvoiceAction } from "@/app/actions/invoices";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function InvoiceDetailClient({ invoice }: { invoice: any }) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleFinalize() {
    setLoading(true);
    try {
      const result = await finalizeInvoiceAction(invoice.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Invoice Finalized! PDF is being generated...");
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to finalize invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-md border shadow-sm space-y-6">
        
        <div className="flex justify-between border-b pb-4">
          <div>
            <h3 className="text-sm font-medium text-slate-500">Bill To</h3>
            <p className="font-semibold text-lg">{invoice.client.clientName}</p>
            {invoice.client.gstin && <p className="text-sm">GSTIN: {invoice.client.gstin}</p>}
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-slate-500">Invoice Details</h3>
            <p className="text-sm">Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-GB')}</p>
            {invoice.dueDate && <p className="text-sm">Due: {new Date(invoice.dueDate).toLocaleDateString('en-GB')}</p>}
            <p className="text-sm">Series: {invoice.series?.name || "Not selected"}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium">Description</th>
              <th className="text-left py-2 font-medium">HSN/SAC</th>
              <th className="text-right py-2 font-medium">Qty</th>
              <th className="text-right py-2 font-medium">Price</th>
              <th className="text-right py-2 font-medium">Tax</th>
              <th className="text-right py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoice.lineItems.map((item: any) => (
              <tr key={item.id}>
                <td className="py-3">{item.description}</td>
                <td className="py-3">{item.hsnSac || '-'}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{item.unitPrice.toFixed(2)}</td>
                <td className="py-3 text-right">{item.taxAmount.toFixed(2)} ({item.taxRate}%)</td>
                <td className="py-3 text-right font-medium">{item.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end pt-4 border-t">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{invoice.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax Total</span>
              <span>{invoice.taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total Amount</span>
              <span>{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {invoice.status === "DRAFT" && (
          <>
            <Button onClick={() => setConfirmOpen(true)} disabled={loading || !invoice.seriesId}>
              {loading ? "Finalizing..." : "Finalize & Generate PDF"}
            </Button>
            <a
              href={`/invoices/${invoice.id}/edit`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2"
            >
              Edit Draft
            </a>
          </>
        )}
        {invoice.status === "DRAFT" && !invoice.seriesId && (
          <p className="text-sm text-red-500 self-center">You must assign an Invoice Series before finalizing.</p>
        )}

        {invoice.status === "FINALIZED" && invoice.driveFileId && (
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2"
          >
            Download PDF
          </a>
        )}
        {invoice.status === "FINALIZED" && invoice.type !== "CREDIT_NOTE" && (
          <a
            href={`/invoices/credit-note/create?linkedInvoiceId=${invoice.id}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 h-10 px-4 py-2"
          >
            Issue Credit Note
          </a>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Finalize Invoice"
        description="Are you sure you want to finalize this invoice? This will lock it, assign a permanent number, and generate the PDF."
        onConfirm={handleFinalize}
        confirmText="Finalize & Generate PDF"
        destructive={false}
      />
    </div>
  );
}
