"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { finalizeInvoiceAction, deleteDraftInvoiceAction, cancelInvoiceAction } from "@/app/actions/invoices";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function InvoiceDetailClient({ invoice, canManage = true }: { invoice: any, canManage?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function handleFinalize() {
    setLoading(true);
    try {
      const result = await finalizeInvoiceAction(invoice.id);
      if (result?.error) { toast.error(result.error); return; }
      toast.success("Invoice Finalized! PDF is being generated...");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize invoice");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteDraftInvoiceAction(invoice.id);
      toast.success("Draft deleted.");
      router.push("/invoices");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelInvoiceAction(invoice.id);
      toast.success("Invoice cancelled.");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
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
              <span>Subtotal</span><span>{invoice.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax Total</span><span>{invoice.taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total Amount</span><span>{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* DRAFT actions */}
        {invoice.status === "DRAFT" && canManage && (
          <>
            <Button onClick={() => setConfirmFinalize(true)} disabled={loading || !invoice.seriesId}>
              {loading ? "Processing..." : "Finalize & Generate PDF"}
            </Button>
            <a
              href={`/invoices/${invoice.id}/edit`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
            >
              Edit Draft
            </a>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)} disabled={loading}>
              Delete Draft
            </Button>
            {!invoice.seriesId && (
              <p className="text-sm text-red-500 self-center">Assign an Invoice Series before finalizing.</p>
            )}
          </>
        )}

        {/* FINALIZED actions */}
        {invoice.status === "FINALIZED" && (
          <>
            {invoice.driveFileId && (
              <a
                href={`/api/invoices/${invoice.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
              >
                Download PDF
              </a>
            )}
            {canManage && (
              <>
                <a
                  href={`/credit-notes/create?linkedInvoiceId=${invoice.id}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 h-10 px-4 py-2"
                >
                  Issue Credit Note
                </a>
                <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => setConfirmCancel(true)} disabled={loading}>
                  Cancel Invoice
                </Button>
              </>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmFinalize}
        onOpenChange={setConfirmFinalize}
        title="Finalize Invoice"
        description="This will lock the invoice, assign a permanent number, and generate the PDF. This cannot be undone."
        onConfirm={handleFinalize}
        confirmText="Finalize & Generate PDF"
        destructive={false}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Draft Invoice"
        description="This will permanently delete this draft. This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel Invoice"
        description="This will mark the invoice as CANCELLED. It will remain in the system for records but cannot be edited."
        onConfirm={handleCancel}
        confirmText="Cancel Invoice"
      />
    </div>
  );
}

