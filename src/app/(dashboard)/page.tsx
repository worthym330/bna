import { getTenantSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { user, organization } = await getTenantSession();

  if (user.isSuperAdmin) {
    redirect("/super-admin");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="rounded-md border bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Welcome to {organization?.displayName}</h2>
        <p className="text-slate-600">
          This is the dashboard overview. Use the sidebar to manage clients, projects, and invoices.
        </p>
      </div>
    </div>
  );
}
