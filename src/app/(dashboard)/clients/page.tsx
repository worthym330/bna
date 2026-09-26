import { getClients } from "@/app/actions/clients";
import { ClientSheet } from "./client-sheet";
import { ClientsClient } from "./clients-client";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <ClientSheet />
      </div>

      <ClientsClient clients={clients} />
    </div>
  );
}
