"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createDraftInvoiceAction } from "@/app/actions/invoices";
import { calculateLineItemTax } from "@/lib/tax";
import { useMemo, useState } from "react";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  hsnSac: z.string().optional(),
  quantity: z.coerce.number().min(0.01),
  unitPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional(),
  seriesId: z.string().optional(),
  templateId: z.string().optional(),
  invoiceDate: z.string().min(1, "Invoice Date is required"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required")
});

type FormData = z.infer<typeof invoiceSchema>;

export function CreateInvoiceForm({ clients, projects, series, templates, organization }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const defaultTemplate = templates?.find((t: any) => t.isDefault);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceDate: new Date().toISOString().split('T')[0],
      templateId: defaultTemplate?.id || "",
      lineItems: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 18 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  const watchLineItems = watch("lineItems");
  const watchClientId = watch("clientId");

  // Tax calculation
  const totals = useMemo(() => {
    let subTotal = 0;
    let taxTotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const selectedClient = clients.find((c: any) => c.id === watchClientId);
    const orgState = organization.defaultCountry || ""; // Simple proxy, ideally state
    const clientState = selectedClient?.state || "";

    watchLineItems?.forEach(item => {
      const amount = (item.quantity || 0) * (item.unitPrice || 0);
      subTotal += amount;
      
      const tax = calculateLineItemTax(amount, item.taxRate || 0, orgState, clientState);
      taxTotal += tax.totalTax;
      cgst += tax.cgst;
      sgst += tax.sgst;
      igst += tax.igst;
    });

    return { subTotal, taxTotal, totalAmount: subTotal + taxTotal, cgst, sgst, igst };
  }, [watchLineItems, watchClientId, clients, organization]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Inject tax calculations into payload
      const selectedClient = clients.find((c: any) => c.id === data.clientId);
      const payload = {
        ...data,
        lineItems: data.lineItems.map(item => {
          const amount = item.quantity * item.unitPrice;
          const tax = calculateLineItemTax(amount, item.taxRate, organization.defaultCountry || "", selectedClient?.state || "");
          return {
            ...item,
            taxAmount: tax.totalTax
          };
        })
      };

      const res = await createDraftInvoiceAction(payload);
      toast.success("Draft Invoice Created!");
      router.push(`/invoices/${res.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-md border shadow-sm">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client *</label>
          <select 
            {...register("clientId")} 
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a Client</option>
            {clients.map((c: any) => (
              <option key={c.id} value={c.id}>{c.clientName}</option>
            ))}
          </select>
          {errors.clientId && <p className="text-sm text-red-500">{errors.clientId.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Project (Optional)</label>
          <select 
            {...register("projectId")}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
          >
            <option value="">None</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>{p.projectName}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Invoice Series</label>
          <select 
            {...register("seriesId")}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
          >
            <option value="">(Draft - Assign on Finalize)</option>
            {series.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} ({s.prefix}...{s.suffix})</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Invoice Template</label>
          <select 
            {...register("templateId")}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
          >
            <option value="">(Default)</option>
            {templates?.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Invoice Date *</label>
          <Input type="date" {...register("invoiceDate")} />
          {errors.invoiceDate && <p className="text-sm text-red-500">{errors.invoiceDate.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Input type="date" {...register("dueDate")} />
        </div>
      </div>

      <div className="pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Line Items</h2>
          <Button type="button" variant="outline" onClick={() => append({ description: "", quantity: 1, unitPrice: 0, taxRate: 18 })}>
            + Add Item
          </Button>
        </div>

        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-sm font-medium text-slate-500">
            <div className="col-span-4">Description</div>
            <div className="col-span-2">HSN/SAC</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1">Tax %</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1"></div>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border p-4 md:p-2 md:border-0 rounded-md">
              <div className="col-span-1 md:col-span-4 space-y-1">
                <label className="md:hidden text-xs text-slate-500">Description</label>
                <Input placeholder="Item description" {...register(`lineItems.${index}.description` as const)} />
                {errors.lineItems?.[index]?.description && <p className="text-xs text-red-500">{errors.lineItems[index].description?.message}</p>}
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="md:hidden text-xs text-slate-500">HSN/SAC</label>
                <Input placeholder="HSN code" {...register(`lineItems.${index}.hsnSac` as const)} />
              </div>
              <div className="col-span-1 md:col-span-1 space-y-1">
                <label className="md:hidden text-xs text-slate-500">Qty</label>
                <Input type="number" step="0.01" {...register(`lineItems.${index}.quantity` as const)} />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="md:hidden text-xs text-slate-500">Unit Price</label>
                <Input type="number" step="0.01" {...register(`lineItems.${index}.unitPrice` as const)} />
              </div>
              <div className="col-span-1 md:col-span-1 space-y-1">
                <label className="md:hidden text-xs text-slate-500">Tax %</label>
                <Input type="number" {...register(`lineItems.${index}.taxRate` as const)} />
              </div>
              <div className="col-span-1 md:col-span-1 space-y-1 text-right font-medium">
                <label className="md:hidden text-xs text-slate-500">Amount</label>
                <div className="py-2">
                  {((watchLineItems?.[index]?.quantity || 0) * (watchLineItems?.[index]?.unitPrice || 0)).toFixed(2)}
                </div>
              </div>
              <div className="col-span-1 md:col-span-1 text-right">
                <Button type="button" variant="ghost" className="text-red-500" onClick={() => remove(index)} disabled={fields.length === 1}>
                  Del
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <div className="w-full md:w-1/3 space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-medium">{totals.subTotal.toFixed(2)}</span>
          </div>
          {totals.cgst > 0 && (
            <div className="flex justify-between text-sm text-slate-500">
              <span>CGST</span>
              <span>{totals.cgst.toFixed(2)}</span>
            </div>
          )}
          {totals.sgst > 0 && (
            <div className="flex justify-between text-sm text-slate-500">
              <span>SGST</span>
              <span>{totals.sgst.toFixed(2)}</span>
            </div>
          )}
          {totals.igst > 0 && (
            <div className="flex justify-between text-sm text-slate-500">
              <span>IGST</span>
              <span>{totals.igst.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-3 border-t">
            <span>Total</span>
            <span>{totals.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Draft"}
        </Button>
      </div>
    </form>
  );
}
