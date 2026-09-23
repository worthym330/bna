import { getTenantSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CreateOrgForm } from "./create-org-form";
import { CreateUserForm } from "./create-user-form";
import { RolesManager } from "./roles-manager";

export default async function SuperAdminDashboard() {
  const { user } = await getTenantSession();

  if (!user.isSuperAdmin) {
    redirect("/");
  }

  const [organizations, permissions] = await Promise.all([
    prisma.organization.findMany({
      include: {
        _count: { select: { members: true, clients: true, invoices: true } },
        roles: {
          include: {
            permissions: { include: { permission: true } },
          }
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            role: {
              include: { permissions: { include: { permission: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.permission.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform-wide management of organizations, users, and roles.</p>
      </div>

      {/* ─── Create Forms ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CreateOrgForm />
        <CreateUserForm organizations={organizations} />
      </div>

      {/* ─── Organizations Overview ─── */}
      <div className="rounded-md border bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">Organizations on Platform</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Legal Name</th>
                <th className="px-6 py-3">Members</th>
                <th className="px-6 py-3">Clients</th>
                <th className="px-6 py-3">Invoices</th>
                <th className="px-6 py-3">Roles</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map(org => (
                <tr key={org.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{org.legalName}</td>
                  <td className="px-6 py-4">{org._count.members}</td>
                  <td className="px-6 py-4">{org._count.clients}</td>
                  <td className="px-6 py-4">{org._count.invoices}</td>
                  <td className="px-6 py-4">{org.roles.length}</td>
                  <td className="px-6 py-4">{new Date(org.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Roles & Permissions Manager ─── */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Roles & Permissions</h2>
        <div className="space-y-6">
          {organizations.map(org => (
            <RolesManager
              key={org.id}
              organizationId={org.id}
              organizationName={org.displayName}
              roles={org.roles as any}
              permissions={permissions}
              members={org.members as any}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
