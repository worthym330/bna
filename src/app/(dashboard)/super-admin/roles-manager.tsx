"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createRoleAction, updateRolePermissionsAction, deleteRoleAction, assignRoleToMemberAction } from "@/app/actions/super-admin";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Role { id: string; name: string; description: string | null; permissions: { permission: { id: string; name: string } }[] }
interface Permission { id: string; name: string; description: string | null }

interface RolesManagerProps {
  organizationId: string;
  organizationName: string;
  roles: Role[];
  permissions: Permission[];
  members: { id: string; user: { name: string | null; email: string }; role: Role | null }[];
}

/** Group flat permission list by the first segment of the name (e.g. "invoices", "clients") */
function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce((acc, perm) => {
    const group = perm.name.split('.')[0];
    const label = group.charAt(0).toUpperCase() + group.slice(1);
    if (!acc[label]) acc[label] = [];
    acc[label].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);
}

/** Derive a human-readable label from a permission name like "invoices.finalize" → "Finalize" */
function permLabel(perm: Permission): string {
  if (perm.description) return perm.description;
  const parts = perm.name.split('.');
  const action = parts[1] || parts[0];
  return action.charAt(0).toUpperCase() + action.slice(1);
}


export function RolesManager({ organizationId, organizationName, roles, permissions, members }: RolesManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<'roles' | 'members' | 'newrole'>('roles');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newPerms, setNewPerms] = useState<Set<string>>(new Set());
  const [roleToDelete, setRoleToDelete] = useState<{ id: string, name: string } | null>(null);

  const permMap = new Map(permissions.map(p => [p.name, p.id]));
  const permGroups = groupPermissions(permissions);

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setSelectedPerms(new Set(role.permissions.map(rp => rp.permission.id)));
    setTab('roles');
  };

  const savePermissions = () => {
    if (!editingRole) return;
    startTransition(async () => {
      try {
        await updateRolePermissionsAction(editingRole.id, Array.from(selectedPerms));
        toast.success("Permissions updated!");
        setEditingRole(null);
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handleDelete = () => {
    if (!roleToDelete) return;
    startTransition(async () => {
      try {
        await deleteRoleAction(roleToDelete.id);
        toast.success("Role deleted");
        setRoleToDelete(null);
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) { toast.error("Role name is required"); return; }
    startTransition(async () => {
      try {
        await createRoleAction({
          organizationId,
          name: newRoleName,
          description: newRoleDesc,
          permissionIds: Array.from(newPerms),
        });
        toast.success(`Role "${newRoleName}" created!`);
        setNewRoleName(""); setNewRoleDesc(""); setNewPerms(new Set()); setTab('roles');
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handleAssignRole = (memberId: string, roleId: string) => {
    startTransition(async () => {
      try {
        await assignRoleToMemberAction(memberId, roleId || null);
        toast.success("Role assigned!");
      } catch (err: any) { toast.error(err.message); }
    });
  };

  // ─── Reusable permission checklist — completely driven by DB data ───────────
  const PermissionChecklist = ({ checked, onChange }: { checked: Set<string>, onChange: (id: string) => void }) => (
    <div className="space-y-5">
      {Object.entries(permGroups).map(([group, perms]) => (
        <div key={group}>
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2 border-b pb-1">{group}</h4>
          <div className="grid grid-cols-2 gap-2">
            {perms.map(perm => (
              <label key={perm.id} className="flex items-center gap-2 cursor-pointer text-sm py-1 px-2 rounded hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={checked.has(perm.id)}
                  onChange={() => onChange(perm.id)}
                  className="rounded accent-primary"
                />
                <span>{permLabel(perm)}</span>
                <span className="text-xs text-slate-400 font-mono ml-auto">{perm.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {permissions.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-4">
          No permissions found in database. Run the seed script first.
        </p>
      )}
    </div>
  );

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="bg-slate-800 text-white p-4">
        <h3 className="font-semibold text-lg">{organizationName}</h3>
        <p className="text-slate-400 text-sm">Roles & Member Management</p>
      </div>

      <div className="flex border-b">
        {[['roles', 'Roles'], ['members', 'Members'], ['newrole', '+ New Role']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* ROLES TAB */}
        {tab === 'roles' && (
          <div className="space-y-3">
            {roles.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No roles yet. Click "+ New Role" to create one.</p>}
            {roles.map(role => (
              <div key={role.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{role.name}</h4>
                    {role.description && <p className="text-xs text-slate-500">{role.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">{role.permissions.length} permissions</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(role)}>Edit Permissions</Button>
                    <Button size="sm" variant="destructive" onClick={() => setRoleToDelete({ id: role.id, name: role.name })}>Delete</Button>
                  </div>
                </div>
                {editingRole?.id === role.id && (
                  <div className="mt-4 pt-4 border-t">
                    <PermissionChecklist 
                      checked={selectedPerms}
                      onChange={(id) => {
                        const next = new Set(selectedPerms);
                        next.has(id) ? next.delete(id) : next.add(id);
                        setSelectedPerms(next);
                      }}
                    />
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={savePermissions} disabled={isPending}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MEMBERS TAB */}
        {tab === 'members' && (
          <div className="space-y-3">
            {members.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No members in this organization.</p>}
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="font-medium text-sm">{m.user.name || m.user.email}</p>
                  <p className="text-xs text-slate-500">{m.user.email}</p>
                  <p className="text-xs text-slate-400">Current: {m.role?.name || 'No Role'}</p>
                </div>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  defaultValue={m.role?.id || ""}
                  onChange={e => handleAssignRole(m.id, e.target.value)}
                >
                  <option value="">No Role</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* NEW ROLE TAB */}
        {tab === 'newrole' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role Name *</label>
              <input className="w-full border rounded px-3 py-2 text-sm" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g. Accountant" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input className="w-full border rounded px-3 py-2 text-sm" value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} placeholder="Optional description" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <PermissionChecklist 
                checked={newPerms}
                onChange={(id) => {
                  const next = new Set(newPerms);
                  next.has(id) ? next.delete(id) : next.add(id);
                  setNewPerms(next);
                }}
              />
            </div>
            <Button onClick={handleCreateRole} disabled={isPending} className="w-full">
              {isPending ? "Creating..." : "Create Role"}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
        title="Delete Role"
        description={`Are you sure you want to delete the "${roleToDelete?.name}" role?`}
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </div>
  );
}
