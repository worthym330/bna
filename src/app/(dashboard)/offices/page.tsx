import { getOffices } from "@/app/actions/offices";
import { OfficeSheet } from "./office-sheet";
import { OfficesClient } from "./offices-client";

export default async function OfficesPage() {
  const offices = await getOffices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Offices</h1>
        <OfficeSheet />
      </div>

      <OfficesClient offices={offices} />
    </div>
  );
}
