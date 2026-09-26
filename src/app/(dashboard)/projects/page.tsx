import { getProjects } from "@/app/actions/projects";
import { getClients } from "@/app/actions/clients";
import { ProjectSheet } from "./project-sheet";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <ProjectSheet clients={clients} />
      </div>

      <ProjectsClient projects={projects} clients={clients} />
    </div>
  );
}
