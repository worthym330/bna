"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createOffice, updateOffice, deleteOffice } from "@/app/actions/offices";
import { officeSchema } from "@/lib/validations";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Office = {
  id: string;
  siteName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string | null;
  gstin: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  siteCode: string | null;
};

const inputCls = "h-11 bg-white border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all rounded-lg text-sm placeholder:text-slate-400";

export function OfficeSheet({ office }: { office?: Office }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isEditing = !!office;

  const form = useForm<z.infer<typeof officeSchema>>({
    resolver: zodResolver(officeSchema),
    defaultValues: {
      siteName: office?.siteName || "",
      siteCode: office?.siteCode || "",
      addressLine1: office?.addressLine1 || "",
      addressLine2: office?.addressLine2 || "",
      city: office?.city || "",
      state: office?.state || "",
      country: office?.country || "India",
      pincode: office?.pincode || "",
      gstin: office?.gstin || "",
      contactPerson: office?.contactPerson || "",
      contactPhone: office?.contactPhone || "",
      contactEmail: office?.contactEmail || "",
    },
  });

  async function onSubmit(values: z.infer<typeof officeSchema>) {
    try {
      if (isEditing) {
        await updateOffice(office.id, values);
      } else {
        await createOffice(values);
      }
      setOpen(false);
      toast.success(isEditing ? "Office updated!" : "Office created!");
      if (!isEditing) form.reset();
    } catch (error) {
      toast.error("Failed to save office");
    }
  }

  async function handleDelete() {
    try {
      await deleteOffice(office!.id);
      setOpen(false);
      toast.success("Office deleted.");
    } catch {
      toast.error("Failed to delete office");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={isEditing ? <Button variant="ghost" size="sm" /> : <Button />}>
        {isEditing ? "Edit" : "Add Office"}
      </SheetTrigger>

      <SheetContent className="p-0 overflow-y-auto sm:max-w-md flex flex-col">
        {/* ── Prominent Header ── */}
        <div className={`p-6 ${isEditing ? "bg-gradient-to-br from-slate-700 to-slate-900" : "bg-gradient-to-br from-cyan-600 to-cyan-800"}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white/20 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{isEditing ? "Edit Office" : "Add New Office"}</h2>
              <p className="text-white/70 text-sm">{isEditing ? `Editing: ${office?.siteName}` : "Fill in the location details below"}</p>
            </div>
          </div>
        </div>

        {/* ── Form Body ── */}
        <div className="flex-1 bg-slate-50 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Section: Basic Info */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">General</p>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  <div className="p-3">
                    <FormField control={form.control} name="siteName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Site Name *</FormLabel>
                        <FormControl><Input {...field} className={inputCls} placeholder="Headquarters" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="siteCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Site Code</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="HQ-01" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="gstin" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GSTIN</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="22AAAAA0000A1Z5" /></FormControl>
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

              {/* Section: Contact */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Contact Details</p>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  <div className="p-3">
                    <FormField control={form.control} name="contactPerson" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact Person</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="Jane Doe" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-100">
                    <div className="p-3">
                      <FormField control={form.control} name="contactPhone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="+91..." /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="p-3">
                      <FormField control={form.control} name="contactEmail" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</FormLabel>
                          <FormControl><Input type="email" {...field} value={field.value || ""} className={inputCls} placeholder="email@..." /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className={`flex-1 h-11 font-semibold rounded-lg ${isEditing ? "bg-slate-800 hover:bg-slate-900" : "bg-cyan-600 hover:bg-cyan-700"}`}
                >
                  {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Office"}
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
        title="Delete Office"
        description="Are you sure you want to delete this office? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </Sheet>
  );
}
