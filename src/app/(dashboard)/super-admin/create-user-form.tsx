"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createUserAction } from "@/app/actions/super-admin";

const PERMISSION_LABELS: Record<string, string> = {
  'invoices.view': 'View Invoices',
  'invoices.create': 'Create Invoices',
  'invoices.edit': 'Edit Invoices',
  'invoices.finalize': 'Finalize & Generate PDF',
  'invoices.delete': 'Delete Invoices',
  'clients.view': 'View Clients',
  'clients.manage': 'Manage Clients',
  'projects.view': 'View Projects',
  'projects.manage': 'Manage Projects',
  'offices.view': 'View Offices',
  'offices.manage': 'Manage Offices',
  'settings.view': 'View Settings',
  'settings.manage': 'Manage Settings & Templates',
  'reports.view': 'View Reports',
};

export function CreateUserForm({ organizations }: { organizations: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgId, setOrgId] = useState("");
  const [roleId, setRoleId] = useState("");

  const selectedOrg = organizations.find(o => o.id === orgId);
  const availableRoles = selectedOrg?.roles || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !orgId) { toast.error("All required fields must be filled"); return; }
    startTransition(async () => {
      try {
        await createUserAction({ name, email, password, organizationId: orgId, roleId: roleId || undefined });
        toast.success(`User "${email}" created!`);
        setName(""); setEmail(""); setPassword(""); setOrgId(""); setRoleId("");
      } catch (err: any) {
        toast.error(err.message || "Failed to create user");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border bg-white p-6 space-y-4">
      <h2 className="text-xl font-semibold">Create New User</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input type="email" className="w-full border rounded px-3 py-2 text-sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@org.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <input type="password" className="w-full border rounded px-3 py-2 text-sm" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Organization *</label>
          <select className="w-full border rounded px-3 py-2 text-sm" value={orgId} onChange={e => { setOrgId(e.target.value); setRoleId(""); }}>
            <option value="">Select organization...</option>
            {organizations.map(o => <option key={o.id} value={o.id}>{o.displayName}</option>)}
          </select>
        </div>
        {orgId && (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={roleId} onChange={e => setRoleId(e.target.value)}>
              <option value="">No Role (read-only access)</option>
              {availableRoles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
