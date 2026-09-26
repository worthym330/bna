"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ProjectSheet } from "./project-sheet";

import { Project, Client } from "@prisma/client";

type ProjectData = Project & { client: Client };

type ClientData = Client;

interface ProjectsClientProps {
  projects: ProjectData[];
  clients: ClientData[];
  canManage?: boolean;
}

export function ProjectsClient({ projects, clients, canManage = true }: ProjectsClientProps) {
  const columns: ColumnDef<ProjectData>[] = [
    {
      accessorKey: "projectName",
      header: "Project Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("projectName")}</span>
    },
    {
      id: "clientName",
      accessorFn: (row) => row.client.clientName,
      header: "Client",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {status}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="text-right">
            {canManage ? <ProjectSheet project={project} clients={clients} canManage={canManage} /> : <span className="text-xs text-slate-400">View Only</span>}
          </div>
        );
      }
    }
  ];

  const handleExport = () => {
    const headers = ['Project Name', 'Client', 'Status'];
    const csvContent = [
      headers.join(','),
      ...projects.map(p => [
        `"${p.projectName}"`,
        `"${p.client.clientName}"`,
        p.status
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'projects_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DataTable 
      columns={columns} 
      data={projects} 
      searchKey="projectName" 
      onExport={handleExport}
    />
  );
}
