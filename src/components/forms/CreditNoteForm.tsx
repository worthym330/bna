"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createDraftCreditNoteAction, updateDraftCreditNoteAction } from "@/app/actions/invoices";
import { calculateLineItemTax } from "@/lib/tax";
import { useMemo, useState, useEffect } from "react";

// ─── Schema ───────────────────────────────────────────────────────────────────

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
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

type FormData = z.infer<typeof creditNoteSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreditNoteFormProps {
  mode: "create" | "edit";
  creditNote?: any;
  linkedInvoice?: any; // pre-linked invoice (create mode via URL param)
  clients: any[];
  projects: any[];
  series: any[];
  templates: any[];
  offices: any[];
  finalizedInvoices: any[];
  organization: any;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreditNoteForm({
  mode,
  creditNote,
  linkedInvoice: linkedInvoiceProp,
  clients,
  projects,
  series,
  templates,
  offices,
  finalizedInvoices,
  organization,
}: CreditNoteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = mode === "edit";

  const defaultTemplate = templates?.find((t: any) => t.isDefault);
  const defaultOffice = offices?.length === 1 ? offices[0].id : "";

  // Track linked invoice for display
  const [selectedLinkedInvoice, setSelectedLinkedInvoice] = useState<any>(
    isEdit
      ? finalizedInvoices?.find((i: any) => i.id === creditNote?.linkedInvoiceId) ?? null
      : (linkedInvoiceProp ?? null)
  );

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(creditNoteSchema) as any,
      defaultValues: isEdit
        ? {
            clientId: creditNote.clientId,
            officeId: creditNote.officeId || defaultOffice,
            projectId: creditNote.projectId || "",
            seriesId: creditNote.seriesId || "",
            templateId: creditNote.templateId || "",
            invoiceDate: new Date(creditNote.creditNoteDate).toISOString().split("T")[0],
            taxType: creditNote.taxType || "CGST_SGST",
            linkedInvoiceId: creditNote.linkedInvoiceId || "",
            reason: creditNote.reason || "",
            notes: creditNote.notes || "",
            lineItems:
              creditNote.lineItems?.length > 0
                ? creditNote.lineItems.map((li: any) => ({
                    description: li.description,
                    hsnSac: li.hsnSac || "",
                    quantity: li.quantity,
                    unitPrice: li.unitPrice,
                    taxRate: li.taxRate,
                  }))
                : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 18 }],
          }
        : {
            invoiceDate: new Date().toISOString().split("T")[0],
            officeId: linkedInvoiceProp?.officeId || defaultOffice,
            templateId: defaultTemplate?.id || "",
            taxType: linkedInvoiceProp?.taxType || "CGST_SGST",
            clientId: linkedInvoiceProp?.clientId || "",
            linkedInvoiceId: linkedInvoiceProp?.id || "",
            reason: linkedInvoiceProp ? "Deduction / rate difference on Final Bill" : "",
            lineItems: linkedInvoiceProp?.lineItems?.length
              ? linkedInvoiceProp.lineItems.map((li: any) => ({
                  description: li.description,
                  hsnSac: li.hsnSac || "",
                  quantity: li.quantity,
                  unitPrice: li.unitPrice,
                  taxRate: li.taxRate,
                }))
              : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 18 }],
          },
    });

  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });
  const watchLineItems = watch("lineItems");
  const watchClientId = watch("clientId");
  const watchOfficeId = watch("officeId");
  const watchTaxType = watch("taxType");

  // Auto-detect IGST vs CGST+SGST
  useEffect(() => {
    const skipAutoDetect =
      isEdit && watchClientId === creditNote?.clientId && watchOfficeId === creditNote?.officeId;
    if (!watchClientId || !watchOfficeId || skipAutoDetect) return;

    const selectedClient = clients.find((c: any) => c.id === watchClientId);
    const selectedOffice = offices.find((o: any) => o.id === watchOfficeId);
    const clientState = selectedClient?.state?.trim().toLowerCase();
    const officeState = selectedOffice?.state?.trim().toLowerCase();

    if (clientState && officeState) {
      setValue("taxType", clientState !== officeState ? "IGST" : "CGST_SGST");
    }
  }, [watchClientId, watchOfficeId, clients, offices, setValue, isEdit, creditNote]);

  // Live totals
  const totals = useMemo(() => {
    let subTotal = 0, taxTotal = 0, cgst = 0, sgst = 0, igst = 0;
    watchLineItems?.forEach((item) => {
      const amount = (item.quantity || 0) * (item.unitPrice || 0);
      subTotal += amount;
      const tax = calculateLineItemTax(amount, item.taxRate || 0, watchTaxType);
      taxTotal += tax.totalTax;
      cgst += tax.cgst;
      sgst += tax.sgst;
      igst += tax.igst;
    });
    return { subTotal, taxTotal, totalAmount: subTotal + taxTotal, cgst, sgst, igst };
  }, [watchLineItems, watchTaxType]);

  // When user picks a linked invoice, pre-fill client
  const handleLinkedInvoiceChange = (invoiceId: string) => {
    const inv = finalizedInvoices?.find((i: any) => i.id === invoiceId);
    setSelectedLinkedInvoice(inv ?? null);
    if (inv) setValue("clientId", inv.clientId);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        lineItems: data.lineItems.map((item) => {
          const amount = item.quantity * item.unitPrice;
          const tax = calculateLineItemTax(amount, item.taxRate, data.taxType as any);
          return { ...item, taxAmount: tax.totalTax, totalAmount: amount + tax.totalTax };
        }),
      };

      if (isEdit) {
        const res = await updateDraftCreditNoteAction(creditNote.id, payload);
        toast.success("Draft Credit Note Updated!");
        router.push(`/credit-notes/${res.id}`);
      } else {
        const res = await createDraftCreditNoteAction(payload);
        toast.success("Credit Note saved as Draft!");
        router.push(`/credit-notes/${res.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || (isEdit ? "Failed to update credit note" : "Failed to create credit note"));
    } finally {
      setLoading(false);
    }
  };

  const selectCls =
    "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Linked Invoice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 mb-3">Against Invoice (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-amber-700">Link to Finalized Invoice</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm bg-white"
              {...register("linkedInvoiceId")}
              onChange={(e) => {
                register("linkedInvoiceId").onChange(e);
                handleLinkedInvoiceChange(e.target.value);
              }}
            >
              <option value="">— Independent Credit Note —</option>
              {finalizedInvoices?.map((inv: any) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.client.clientName} (Rs.{inv.totalAmount.toLocaleString()})
                </option>
              ))}
            </select>
            {selectedLinkedInvoice && (
              <p className="text-xs text-amber-600 mt-1">
                Linked to {selectedLinkedInvoice.invoiceNumber} &bull; Client pre-filled below
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

      {/* Credit Note Details */}
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
              {offices.map((o: any) => <option key={o.id} value={o.id}>{o.siteName} ({o.state})</option>)}
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
              <option value="CGST_SGST">CGST &amp; SGST</option>
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

      {/* Line Items */}
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
            <div className="col-span-1" />
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
                  Rs.{(amount + tax.totalTax).toFixed(2)}
                </div>
                <div className="col-span-1">
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 text-xl font-bold w-full">x</button>
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
            <div className="flex justify-between"><span className="text-slate-500">Sub Total</span><span>Rs.{totals.subTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>Rs.{totals.taxTotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2 text-red-600">
              <span>Total Credit</span><span>Rs.{totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-md border shadow-sm p-6">
        <label className="block text-sm font-medium mb-1">Internal Notes</label>
        <textarea className="w-full border rounded px-3 py-2 text-sm min-h-[80px]" placeholder="Optional notes..." {...register("notes")} />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
          {loading ? "Saving..." : isEdit ? "Update Draft Credit Note" : "Save Credit Note as Draft"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(isEdit ? `/credit-notes/${creditNote.id}` : "/credit-notes")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
