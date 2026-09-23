import { getOffices } from "@/app/actions/offices";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OfficeSheet } from "./office-sheet";

export default async function OfficesPage() {
  const offices = await getOffices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Offices</h1>
        <OfficeSheet />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No offices found.
                </TableCell>
              </TableRow>
            ) : (
              offices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell className="font-medium">{office.siteName}</TableCell>
                  <TableCell>{office.city}</TableCell>
                  <TableCell>{office.gstin || "-"}</TableCell>
                  <TableCell className="text-right">
                    <OfficeSheet office={office} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
