"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createProject, updateProject, deleteProject } from "@/app/actions/projects";
import { projectSchema } from "@/lib/validations";

type Client = { id: string; clientName: string };

type Project = {
  id: string;
  clientId: string;
  projectName: string;
  projectCode: string | null;
  projectAddress: string | null;
  workOrderNumber: string | null;
  workOrderDate: Date | string | null;
  projectStartDate: Date | string | null;
  projectEndDate: Date | string | null;
  sacCategory: string | null;
  description: string | null;
  status: string;
};

export function ProjectSheet({ project, clients }: { project?: Project; clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!project;

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientId: project?.clientId || "",
      projectName: project?.projectName || "",
      projectCode: project?.projectCode || "",
      projectAddress: project?.projectAddress || "",
      workOrderNumber: project?.workOrderNumber || "",
      workOrderDate: project?.workOrderDate ? new Date(project.workOrderDate).toISOString().split('T')[0] : "",
      projectStartDate: project?.projectStartDate ? new Date(project.projectStartDate).toISOString().split('T')[0] : "",
      projectEndDate: project?.projectEndDate ? new Date(project.projectEndDate).toISOString().split('T')[0] : "",
      sacCategory: project?.sacCategory || "",
      description: project?.description || "",
      status: project?.status || "ACTIVE",
    },
  });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    try {
      if (isEditing) {
        await updateProject(project.id, values);
      } else {
        await createProject(values);
      }
      setOpen(false);
      if (!isEditing) form.reset();
    } catch (error) {
      console.error(error);
      alert("Failed to save project");
    }
  }

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(project!.id);
        setOpen(false);
      } catch (error) {
        alert("Failed to delete project");
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={isEditing ? <Button variant="ghost" size="sm" /> : <Button />}>
        {isEditing ? "Edit" : "Add Project"}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Project" : "Add Project"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update the details for this project." : "Enter the details for the new project."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Code</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Address</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workOrderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WO Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workOrderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WO Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sacCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SAC Category</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select a Client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.clientName}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ON_HOLD">On Hold</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex items-center justify-between">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
              </Button>
              {isEditing && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={form.formState.isSubmitting}>
                  Delete
                </Button>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
