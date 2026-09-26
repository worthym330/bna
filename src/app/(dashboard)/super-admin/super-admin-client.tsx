"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  updateOrganizationAction,
  deleteOrganizationAction,
  updateUserAction,
  deleteUserAction,
  resetUserPasswordAction,
} from "@/app/actions/super-admin";

// ─── Org Card ─────────────────────────────────────────────────────────────────

function OrgCard({ org, users }: { org: any; users: any[] }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ legalName: org.legalName, displayName: org.displayName, email: org.email || "", gstin: org.gstin || "", pan: org.pan || "" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const orgUsers = users.filter(u => u.organizationId === org.id);

  async function handleUpdate() {
    setLoading(true);
    try {
      await updateOrganizationAction(org.id, form);
      toast.success("Organization updated!");
      setEditing(false);
    } catch (err: any) { toast.error(err.message || "Failed to update"); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteOrganizationAction(org.id);
      toast.success("Organization deleted.");
    } catch (err: any) { toast.error(err.message || "Failed to delete"); }
    finally { setLoading(false); }
  }

  return (
    <div className="border rounded-lg bg-white p-4 space-y-3">
      {editing ? (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500">Legal Name</label><Input value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} className="h-8" /></div>
          <div><label className="text-xs text-slate-500">Display Name</label><Input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} className="h-8" /></div>
          <div><label className="text-xs text-slate-500">Email</label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-8" /></div>
          <div><label className="text-xs text-slate-500">GSTIN</label><Input value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} className="h-8" /></div>
          <div><label className="text-xs text-slate-500">PAN</label><Input value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value })} className="h-8" /></div>
          <div className="flex gap-2 items-end">
            <Button size="sm" onClick={handleUpdate} disabled={loading}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{org.legalName}</p>
            <p className="text-sm text-slate-500">{org.displayName} · {org._count?.members ?? orgUsers.length} members · {org._count?.invoices ?? 0} invoices</p>
            {org.gstin && <p className="text-xs text-slate-400">GSTIN: {org.gstin}</p>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>Delete</Button>
          </div>
        </div>
      )}

      {/* Users under this org */}
      {orgUsers.length > 0 && (
        <div className="border-t pt-2 space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Users</p>
          {orgUsers.map(u => <UserRow key={u.id} user={u} />)}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Organization"
        description={`Delete "${org.legalName}"? This only works if no members are assigned.`}
        onConfirm={handleDelete}
        confirmText="Delete Org"
      />
    </div>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────

function UserRow({ user }: { user: any }) {
  const [editing, setEditing] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);
  const [form, setForm] = useState({ name: user.name || "", email: user.email });
  const [newPw, setNewPw] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    try {
      await updateUserAction(user.id, form);
      toast.success("User updated!");
      setEditing(false);
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteUserAction(user.id);
      toast.success("User deleted.");
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setLoading(false); }
  }

  async function handleResetPw() {
    if (!newPw || newPw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await resetUserPasswordAction(user.id, newPw);
      toast.success("Password reset!");
      setResettingPw(false);
      setNewPw("");
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setLoading(false); }
  }

  if (editing) {
    return (
      <div className="flex gap-2 items-center bg-slate-50 rounded p-2">
        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="h-7 text-sm" />
        <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="h-7 text-sm" />
        <Button size="sm" onClick={handleUpdate} disabled={loading}>Save</Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    );
  }

  if (resettingPw) {
    return (
      <div className="flex gap-2 items-center bg-slate-50 rounded p-2">
        <span className="text-sm text-slate-600 min-w-24">{user.email}</span>
        <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" className="h-7 text-sm" />
        <Button size="sm" onClick={handleResetPw} disabled={loading}>Reset</Button>
        <Button size="sm" variant="outline" onClick={() => setResettingPw(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center text-sm py-1">
      <span>{user.name || user.email} <span className="text-slate-400 text-xs">{user.email}</span></span>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditing(true)}>Edit</Button>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setResettingPw(true)}>Reset PW</Button>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-red-500 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>Delete</Button>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete User"
        description={`Delete "${user.email}"? This will remove them from all organizations.`}
        onConfirm={handleDelete}
        confirmText="Delete User"
      />
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function SuperAdminClient({ organizations, users }: { organizations: any[]; users: any[] }) {
  return (
    <div className="space-y-4">
      {organizations.map(org => (
        <OrgCard key={org.id} org={org} users={users} />
      ))}
      {organizations.length === 0 && (
        <p className="text-slate-500 text-sm">No organizations yet.</p>
      )}
    </div>
  );
}
