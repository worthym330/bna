import { getProjects } from "@/app/actions/projects";
import { getClients } from "@/app/actions/clients";
import { ProjectSheet } from "./project-sheet";
import { ProjectsClient } from "./projects-client";

import { getTenantSession } from "@/lib/auth";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const clients = await getClients();
  const session = await getTenantSession();
  const canManage = session.user.isSuperAdmin || session.permissions.includes("projects.manage");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <ProjectSheet clients={clients} canManage={canManage} />
      </div>

      <ProjectsClient projects={projects} clients={clients} canManage={canManage} />
    </div>
  );
}
