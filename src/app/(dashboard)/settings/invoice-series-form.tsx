"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInvoiceSeriesAction, updateInvoiceSeriesAction, deleteInvoiceSeriesAction } from "@/app/actions/numbering";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function InvoiceSeriesForm({ existingSeries, type = "INVOICE", title = "Numbering Series" }: { existingSeries: any[]; type?: string; title?: string }) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      await createInvoiceSeriesAction(formData);
      toast.success("Invoice Series created!");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to create Invoice Series");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    setLoading(true);
    try {
      await updateInvoiceSeriesAction(id, {
        name: editData.name,
        prefix: editData.prefix,
        suffix: editData.suffix,
        padding: Number(editData.padding),
        isActive: editData.isActive,
      });
      toast.success("Series updated!");
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      await deleteInvoiceSeriesAction(id);
      toast.success("Series deleted.");
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 bg-white p-6 rounded-md border shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-slate-500">Configure the format for your auto-generated invoice numbers.</p>

      {/* Existing series list */}
      {existingSeries.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-medium">Existing Sequences:</h3>
          {existingSeries.map(series => (
            <div key={series.id} className="p-3 bg-slate-50 border rounded-md text-sm">
              {editingId === series.id ? (
                /* Edit row */
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
                  <div>
                    <label className="text-xs text-slate-500">Name</label>
                    <Input
                      value={editData.name}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Prefix</label>
                    <Input
                      value={editData.prefix}
                      onChange={e => setEditData({ ...editData, prefix: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Suffix</label>
                    <Input
                      value={editData.suffix}
                      onChange={e => setEditData({ ...editData, suffix: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Padding</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={editData.padding}
                      onChange={e => setEditData({ ...editData, padding: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(series.id)} disabled={loading}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                  <div className="col-span-2 md:col-span-5 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`active-${series.id}`}
                      checked={editData.isActive}
                      onChange={e => setEditData({ ...editData, isActive: e.target.checked })}
                    />
                    <label htmlFor={`active-${series.id}`} className="text-xs text-slate-600">Active</label>
                  </div>
                </div>
              ) : (
                /* View row */
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{series.name}</span>
                    <span className="text-slate-500 ml-2">
                      Format: {series.prefix}{'0'.repeat(series.padding)}{series.suffix}
                    </span>
                    {!series.isActive && (
                      <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border">
                      Next: #{series.currentSequence + 1}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(series.id);
                        setEditData({
                          name: series.name,
                          prefix: series.prefix,
                          suffix: series.suffix,
                          padding: series.padding,
                          isActive: series.isActive,
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteConfirmId(series.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create new series form */}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end border-t pt-4">
        <input type="hidden" name="type" value={type} />
        <div className="space-y-2">
          <label className="text-sm font-medium">Series Name</label>
          <Input name="name" placeholder="e.g., Standard FY25-26" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Prefix</label>
          <Input name="prefix" placeholder="e.g., INV/" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Suffix</label>
          <Input name="suffix" placeholder="e.g., /BOM" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Padding (Zeroes)</label>
          <Input name="padding" type="number" min={1} max={10} defaultValue={4} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Starts From</label>
          <Input name="startSequence" type="number" min={1} defaultValue={1} required />
        </div>
        <div className="flex justify-end mt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Sequence"}
          </Button>
        </div>
      </form>

      {deleteConfirmId && (
        <ConfirmDialog
          open={!!deleteConfirmId}
          onOpenChange={() => setDeleteConfirmId(null)}
          title="Delete Invoice Series"
          description="This series will be permanently deleted. This only works if no invoices have used it."
          onConfirm={() => handleDelete(deleteConfirmId)}
          confirmText="Delete Series"
        />
      )}
    </section>
  );
}
