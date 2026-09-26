import { getTenantSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CreateOrgForm } from "./create-org-form";
import { CreateUserForm } from "./create-user-form";
import { RolesManager } from "./roles-manager";
import { SuperAdminClient } from "./super-admin-client";

export default async function SuperAdminDashboard() {
  const { user } = await getTenantSession();

  if (!user.isSuperAdmin) {
    redirect("/dashboard");
  }

  const [organizations, permissions, allUsers, googleCredential] = await Promise.all([
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
    prisma.permission.findMany({ orderBy: { name: 'asc' } }),
    prisma.organizationMember.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.googleCredential.findUnique({
      where: { userId: user.id }
    })
  ]);

  // Flatten users with their organizationId for easy lookup
  const users = allUsers.map(m => ({ ...m.user, organizationId: m.organizationId }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform-wide management of organizations, users, and roles.</p>
      </div>

      {/* ─── System Integrations ─── */}
      <div className="rounded-md border bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">System Integrations</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">System Email Account (Gmail)</h3>
            <p className="text-sm text-slate-500">
              Connect a central Google account to send welcome emails and password reset links to new users.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {googleCredential ? (
              <span className="text-sm text-green-600 font-medium">✓ Connected</span>
            ) : (
              <span className="text-sm text-red-600 font-medium">Not Connected</span>
            )}
            <a href="/api/auth/google">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                {googleCredential ? "Reconnect Gmail" : "Connect Gmail"}
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* ─── Create Forms ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CreateOrgForm />
        <CreateUserForm organizations={organizations} />
      </div>

      {/* ─── Organizations Overview ─── */}
      <div className="rounded-md border bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">Organizations on Platform</h2>
        <SuperAdminClient organizations={organizations} users={users} />
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
