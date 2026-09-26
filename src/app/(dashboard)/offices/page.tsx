import { getOffices } from "@/app/actions/offices";
import { OfficeSheet } from "./office-sheet";
import { OfficesClient } from "./offices-client";

import { getTenantSession } from "@/lib/auth";

export default async function OfficesPage() {
  const offices = await getOffices();
  const session = await getTenantSession();
  const canManage = session.user.isSuperAdmin || session.permissions.includes("offices.manage");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Offices</h1>
        <OfficeSheet canManage={canManage} />
      </div>

      <OfficesClient offices={offices} canManage={canManage} />
    </div>
  );
}
