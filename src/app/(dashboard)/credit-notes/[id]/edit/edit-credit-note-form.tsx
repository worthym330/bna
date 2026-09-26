"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateDraftCreditNoteAction } from "@/app/actions/invoices";
import { calculateLineItemTax } from "@/lib/tax";
import { useMemo, useState, useEffect } from "react";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  hsnSac: z.string().optional(),
  quantity: z.coerce.number().min(0.01),
  unitPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0),
});

const creditNoteSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  officeId: z.string().min(1, "Billing Office is required"),
  projectId: z.string().optional(),
  seriesId: z.string().optional(),
  templateId: z.string().optional(),
  invoiceDate: z.string().min(1, "Credit Note Date is required"),
  taxType: z.enum(["CGST_SGST", "IGST"]).default("CGST_SGST"),
  linkedInvoiceId: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required")
});

type FormData = z.infer<typeof creditNoteSchema>;

export function EditCreditNoteForm({ creditNote, clients, projects, series, templates, offices, finalizedInvoices, organization }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedLinkedInvoice, setSelectedLinkedInvoice] = useState<any>(
    creditNote.linkedInvoiceId ? finalizedInvoices?.find((i: any) => i.id === creditNote.linkedInvoiceId) : null
  );

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(creditNoteSchema) as any,
    defaultValues: {
      clientId: creditNote.clientId,
      officeId: creditNote.officeId || (offices?.length === 1 ? offices[0].id : ""),
      projectId: creditNote.projectId || "",
      seriesId: creditNote.seriesId || "",
      templateId: creditNote.templateId || "",
      invoiceDate: new Date(creditNote.creditNoteDate).toISOString().split('T')[0],
      taxType: creditNote.taxType || "CGST_SGST",
      linkedInvoiceId: creditNote.linkedInvoiceId || "",
      reason: creditNote.reason || "",
      notes: creditNote.notes || "",
      lineItems: creditNote.lineItems.length > 0 ? creditNote.lineItems.map((li: any) => ({
        description: li.description,
        hsnSac: li.hsnSac || "",
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        taxRate: li.taxRate,
      })) : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 18 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  const watchLineItems = watch("lineItems");
  const watchClientId = watch("clientId");
  const watchOfficeId = watch("officeId");
  const watchTaxType = watch("taxType");

  // Auto-detect tax type based on states (only when clientId or officeId changes, not initially unless required)
  useEffect(() => {
    if (watchClientId && watchOfficeId && (watchClientId !== creditNote.clientId || watchOfficeId !== creditNote.officeId)) {
      const selectedClient = clients.find((c: any) => c.id === watchClientId);
      const selectedOffice = offices.find((o: any) => o.id === watchOfficeId);
      const clientState = selectedClient?.state?.trim().toLowerCase();
      const officeState = selectedOffice?.state?.trim().toLowerCase();
      
      if (clientState && officeState) {
        if (clientState !== officeState) {
          setValue("taxType", "IGST");
        } else {
          setValue("taxType", "CGST_SGST");
        }
      }
    }
  }, [watchClientId, watchOfficeId, clients, offices, setValue, creditNote.clientId, creditNote.officeId]);

  // Tax calculation
  const totals = useMemo(() => {
    let subTotal = 0;
    let taxTotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const selectedClient = clients.find((c: any) => c.id === watchClientId);
    const orgState = organization.defaultCountry || ""; 
    const clientState = selectedClient?.state || "";
    watchLineItems?.forEach(item => {
      const amount = (item.quantity || 0) * (item.unitPrice || 0);
      subTotal += amount;
      
      const tax = calculateLineItemTax(amount, item.taxRate || 0, watchTaxType);
      taxTotal += tax.totalTax;
      cgst += tax.cgst;
      sgst += tax.sgst;
      igst += tax.igst;
    });

    return { subTotal, taxTotal, totalAmount: subTotal + taxTotal, cgst, sgst, igst };
  }, [watchLineItems, watchClientId, clients, organization, watchTaxType]);

  const handleLinkedInvoiceChange = (invoiceId: string) => {
    const inv = finalizedInvoices?.find((i: any) => i.id === invoiceId);
    setSelectedLinkedInvoice(inv || null);
    if (inv) {
      setValue("clientId", inv.clientId);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        lineItems: data.lineItems.map(item => {
          const amount = item.quantity * item.unitPrice;
          const tax = calculateLineItemTax(amount, item.taxRate, data.taxType as any);
          return {
            ...item,
            taxAmount: tax.totalTax,
            totalAmount: amount + tax.totalTax
          };
        })
      };

      const res = await updateDraftCreditNoteAction(creditNote.id, payload);
      toast.success("Draft Credit Note Updated!");
      router.push(`/credit-notes/${res.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* ─── Link to Invoice Banner ─── */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 mb-3">Against Invoice (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-amber-700">Link to Finalized Invoice</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm bg-white"
              {...register("linkedInvoiceId")}
              onChange={e => { register("linkedInvoiceId").onChange(e); handleLinkedInvoiceChange(e.target.value); }}
            >
              <option value="">— Independent Credit Note —</option>
              {finalizedInvoices?.map((inv: any) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.client.clientName} (₹{inv.totalAmount.toLocaleString()})
                </option>
              ))}
            </select>
            {selectedLinkedInvoice && (
              <p className="text-xs text-amber-600 mt-1">
                ✓ Linked to {selectedLinkedInvoice.invoiceNumber} • Client pre-filled below
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-amber-700">Reason for Credit Note</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm min-h-[60px]"
              placeholder="e.g. Deduction / rate difference on Final Bill"
              {...register("reason")}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">Credit Note Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Client *</label>
            <select className="w-full border rounded px-3 py-2 text-sm" {...register("clientId")}>
              <option value="">Select client...</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.clientName}</option>)}
            </select>
            {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Billing Office *</label>
            <select className="w-full border rounded px-3 py-2 text-sm" {...register("officeId")}>
              <option value="">Select an Office</option>
              {offices.map((o: any) => (
                <option key={o.id} value={o.id}>{o.siteName} ({o.state})</option>
              ))}
            </select>
            {errors.officeId && <p className="text-xs text-red-500 mt-1">{errors.officeId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Credit Note Date *</label>
            <Input type="date" {...register("invoiceDate")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tax Type *</label>
            <select className="w-full border rounded px-3 py-2 text-sm" {...register("taxType")}>
              <option value="CGST_SGST">CGST & SGST</option>
              <option value="IGST">IGST</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <select className="w-full border rounded px-3 py-2 text-sm" {...register("projectId")}>
              <option value="">None</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.projectName}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Invoice Series (for numbering)</label>
            <select className="w-full border rounded px-3 py-2 text-sm" {...register("seriesId")}>
              <option value="">Select series...</option>
              {series.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.prefix}XXX{s.suffix})</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Template</label>
            <select className="w-full border rounded px-3 py-2 text-sm" {...register("templateId")}>
              <option value="">Default Template</option>
              {templates.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}{t.isDefault ? " (Default)" : ""}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Items Being Credited</h2>
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase px-2">
            <div className="col-span-4">Description</div>
            <div className="col-span-2">HSN/SAC</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1">Tax %</div>
            <div className="col-span-1 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>
          {fields.map((field, index) => {
            const item = watchLineItems[index];
            const amount = (item?.quantity || 0) * (item?.unitPrice || 0);
            const tax = calculateLineItemTax(amount, item?.taxRate || 0, watchTaxType);
            return (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-2">
                <div className="col-span-12 md:col-span-4">
                  <Input placeholder="Description" {...register(`lineItems.${index}.description`)} />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input placeholder="HSN/SAC" {...register(`lineItems.${index}.hsnSac`)} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Input type="number" step="0.01" placeholder="Qty" {...register(`lineItems.${index}.quantity`)} />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Input type="number" step="0.01" placeholder="Price" {...register(`lineItems.${index}.unitPrice`)} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Input type="number" step="0.01" placeholder="Tax%" {...register(`lineItems.${index}.taxRate`)} />
                </div>
                <div className="col-span-4 md:col-span-1 text-right font-semibold text-sm text-slate-700">
                  ₹{(amount + tax.totalTax).toFixed(2)}
                </div>
                <div className="col-span-1">
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 text-xl font-bold w-full">×</button>
                  )}
                </div>
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", hsnSac: "", quantity: 1, unitPrice: 0, taxRate: 18 })}>
            + Add Line Item
          </Button>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="w-72 space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between"><span className="text-slate-500">Sub Total</span><span>₹{totals.subTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>₹{totals.taxTotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2 text-red-600">
              <span>Total Credit</span><span>₹{totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm p-6">
        <label className="block text-sm font-medium mb-1">Internal Notes</label>
        <textarea className="w-full border rounded px-3 py-2 text-sm min-h-[80px]" placeholder="Optional notes..." {...register("notes")} />
      </div>

      <div className="pt-6 flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
          {loading ? "Saving..." : "Update Draft Credit Note"}
        </Button>
      </div>
    </form>
  );
}

