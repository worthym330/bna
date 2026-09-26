"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInvoiceSeriesAction } from "@/app/actions/numbering";
import { toast } from "sonner";

export function InvoiceSeriesForm({ existingSeries }: { existingSeries: any[] }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      await createInvoiceSeriesAction(formData);
      toast.success("Invoice Series created successfully!");
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create Invoice Series");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 bg-white p-6 rounded-md border shadow-sm">
      <h2 className="text-xl font-semibold">Invoice Numbering Series</h2>
      <p className="text-sm text-slate-500 mb-4">
        Configure the format for your auto-generated invoice numbers.
      </p>

      {existingSeries.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-medium">Existing Sequences:</h3>
          {existingSeries.map(series => (
            <div key={series.id} className="p-3 bg-slate-50 border rounded-md flex justify-between items-center text-sm">
              <div>
                <strong>{series.name}</strong> 
                <span className="text-slate-500 ml-2">
                  Format: {series.prefix}[{'0'.repeat(series.padding)}]{series.suffix}
                </span>
              </div>
              <div className="text-xs font-mono bg-white px-2 py-1 rounded border">
                Current Sequence: {series.currentSequence} (Next: {series.currentSequence + 1})
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end border-t pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Series Name</label>
          <Input name="name" placeholder="e.g., Standard FY23-24" required />
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

        <div className="md:col-span-2 flex justify-end mt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Sequence"}
          </Button>
        </div>
      </form>
    </section>
  );
}
