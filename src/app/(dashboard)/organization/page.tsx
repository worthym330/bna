import { getTenantSession } from "@/lib/auth";
import { OrgProfileForm } from "./org-form";

export default async function OrganizationProfilePage() {
  const { organization } = await getTenantSession();

  if (!organization) {
    return <div>No organization found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Profile</h1>
        <p className="text-slate-500">Manage your company's global settings and tax registrations.</p>
      </div>

      <div className="rounded-md border bg-white p-8 shadow-sm">
        <OrgProfileForm organization={organization} />
      </div>
    </div>
  );
}
