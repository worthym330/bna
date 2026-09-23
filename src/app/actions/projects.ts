"use server";
import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { projectSchema } from "@/lib/validations";
import * as z from "zod";

export async function getProjects() {
  const { organization } = await getTenantSession();
  return prisma.project.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProject(data: z.infer<typeof projectSchema>) {
  const { organization } = await getTenantSession();
  const parsed = projectSchema.parse(data);
  const project = await prisma.project.create({
    data: {
      ...parsed,
      workOrderDate: parsed.workOrderDate ? new Date(parsed.workOrderDate) : null,
      projectStartDate: parsed.projectStartDate ? new Date(parsed.projectStartDate) : null,
      projectEndDate: parsed.projectEndDate ? new Date(parsed.projectEndDate) : null,
      organizationId: organization.id,
    },
  });
  revalidatePath("/projects");
  return project;
}

export async function updateProject(id: string, data: z.infer<typeof projectSchema>) {
  const { organization } = await getTenantSession();
  
  const existingProject = await prisma.project.findUnique({ where: { id } });
  if (!existingProject || existingProject.organizationId !== organization.id) {
    throw new Error("Project not found");
  }

  const parsed = projectSchema.parse(data);

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...parsed,
      workOrderDate: parsed.workOrderDate ? new Date(parsed.workOrderDate) : null,
      projectStartDate: parsed.projectStartDate ? new Date(parsed.projectStartDate) : null,
      projectEndDate: parsed.projectEndDate ? new Date(parsed.projectEndDate) : null,
    },
  });
  revalidatePath("/projects");
  return project;
}

export async function deleteProject(id: string) {
  const { organization } = await getTenantSession();
  
  const existingProject = await prisma.project.findUnique({ where: { id } });
  if (!existingProject || existingProject.organizationId !== organization.id) {
    throw new Error("Project not found");
  }

  // Soft delete
  await prisma.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  
  revalidatePath("/projects");
  return { success: true };
}
