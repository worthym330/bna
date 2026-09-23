"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createOrganizationAction } from "@/app/actions/super-admin";

export function CreateOrgForm() {
  const [isPending, startTransition] = useTransition();
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName || !displayName) { toast.error("Legal Name and Display Name are required"); return; }
    startTransition(async () => {
      try {
        await createOrganizationAction({ legalName, displayName, email, gstin, pan });
        toast.success(`Organization "${displayName}" created!`);
        setLegalName(""); setDisplayName(""); setEmail(""); setGstin(""); setPan("");
      } catch (err: any) {
        toast.error(err.message || "Failed to create organization");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border bg-white p-6 space-y-4">
      <h2 className="text-xl font-semibold">Create New Organization</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Legal Name *</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="BHAGYA AND ASSOCIATES" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Display Name *</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Bhagya and Associates" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@org.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GSTIN</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="22AAAAA0000A1Z5" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">PAN</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={pan} onChange={e => setPan(e.target.value)} placeholder="AAAAA0000A" />
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Organization"}
      </Button>
    </form>
  );
}
