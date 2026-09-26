"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient, updateClient, deleteClient } from "@/app/actions/clients";
import { clientSchema } from "@/lib/validations";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Client = {
  id: string;
  clientName: string;
  clientCode: string | null;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  pan: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
};

const inputCls = "h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-lg text-sm placeholder:text-slate-400";

export function ClientSheet({ client }: { client?: Client }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isEditing = !!client;

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientName: client?.clientName || "",
      clientCode: client?.clientCode || "",
      email: client?.email || "",
      phone: client?.phone || "",
      gstin: client?.gstin || "",
      pan: client?.pan || "",
      addressLine1: client?.addressLine1 || "",
      addressLine2: client?.addressLine2 || "",
      city: client?.city || "",
      state: client?.state || "",
      country: client?.country || "India",
      pincode: client?.pincode || "",
    },
  });

  async function onSubmit(values: z.infer<typeof clientSchema>) {
    try {
      if (isEditing) {
        await updateClient(client.id, values);
      } else {
        await createClient(values);
      }
      setOpen(false);
      toast.success(isEditing ? "Client updated!" : "Client created!");
      if (!isEditing) form.reset();
    } catch (error) {
      toast.error("Failed to save client");
    }
  }

  async function handleDelete() {
    try {
      await deleteClient(client!.id);
      setOpen(false);
      toast.success("Client deleted.");
    } catch {
      toast.error("Failed to delete client");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={isEditing ? <Button variant="ghost" size="sm" /> : <Button />}>
        {isEditing ? "Edit" : "Add Client"}
      </SheetTrigger>

      <SheetContent className="p-0 overflow-y-auto sm:max-w-md flex flex-col">
        {/* ── Prominent Header ── */}
        <div className={`p-6 ${isEditing ? "bg-gradient-to-br from-slate-700 to-slate-900" : "bg-gradient-to-br from-indigo-600 to-indigo-800"}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white/20 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{isEditing ? "Edit Client" : "Add New Client"}</h2>
              <p className="text-white/70 text-sm">{isEditing ? `Editing: ${client?.clientName}` : "Fill in the details below"}</p>
            </div>
          </div>
        </div>

        {/* ── Form Body ── */}
        <div className="flex-1 bg-slate-50 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Section: Basic Info */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Basic Information</p>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  <div className="p-3">
                    <FormField control={form.control} name="clientName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Client Name *</FormLabel>
                        <FormControl><Input {...field} className={inputCls} placeholder="Acme Corporation" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="clientCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Client Code</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="ACM-001" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Section: Contact */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Contact Details</p>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  <div className="p-3">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</FormLabel>
                        <FormControl><Input type="email" {...field} value={field.value || ""} className={inputCls} placeholder="contact@company.com" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="+91 98765 43210" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Section: Address */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Address</p>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  <div className="p-3">
                    <FormField control={form.control} name="addressLine1" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Address Line 1 *</FormLabel>
                        <FormControl><Input {...field} className={inputCls} placeholder="123 Business Avenue" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="addressLine2" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Address Line 2</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="Suite 400" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-100">
                    <div className="p-3">
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">City *</FormLabel>
                          <FormControl><Input {...field} className={inputCls} placeholder="Mumbai" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="p-3">
                      <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">State *</FormLabel>
                          <FormControl><Input {...field} className={inputCls} placeholder="Maharashtra" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-100">
                    <div className="p-3">
                      <FormField control={form.control} name="pincode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pincode</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="400001" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="p-3">
                      <FormField control={form.control} name="country" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Country *</FormLabel>
                          <FormControl><Input {...field} className={inputCls} placeholder="India" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Tax */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Tax Information</p>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  <div className="p-3">
                    <FormField control={form.control} name="gstin" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GSTIN</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="22AAAAA0000A1Z5" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="pan" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">PAN</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="AAAAA0000A" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className={`flex-1 h-11 font-semibold rounded-lg ${isEditing ? "bg-slate-800 hover:bg-slate-900" : "bg-indigo-600 hover:bg-indigo-700"}`}
                >
                  {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Client"}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" className="h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg" onClick={() => setConfirmOpen(true)} disabled={form.formState.isSubmitting}>
                    Delete
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </Sheet>
  );
}
