import { getClients } from "@/app/actions/clients";
import { ClientSheet } from "./client-sheet";
import { ClientsClient } from "./clients-client";

import { getTenantSession } from "@/lib/auth";

export default async function ClientsPage() {
  const clients = await getClients();
  const session = await getTenantSession();
  const canManage = session.user.isSuperAdmin || session.permissions.includes("clients.manage");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <ClientSheet canManage={canManage} />
      </div>

      <ClientsClient clients={clients} canManage={canManage} />
    </div>
  );
}
