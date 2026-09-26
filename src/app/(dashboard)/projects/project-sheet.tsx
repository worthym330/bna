"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createProject, updateProject, deleteProject } from "@/app/actions/projects";
import { projectSchema } from "@/lib/validations";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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

const inputCls = "h-11 bg-white border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all rounded-lg text-sm placeholder:text-slate-400";
const selectCls = "flex h-11 w-full bg-white border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all rounded-lg text-sm px-3";

export function ProjectSheet({ project, clients, canManage = true }: { project?: Project; clients: Client[], canManage?: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
      toast.success(isEditing ? "Project updated!" : "Project created!");
      if (!isEditing) form.reset();
    } catch (error) {
      toast.error("Failed to save project");
    }
  }

  async function handleDelete() {
    try {
      await deleteProject(project!.id);
      setOpen(false);
      toast.success("Project deleted.");
    } catch {
      toast.error("Failed to delete project");
    }
  }

  if (!isEditing && !canManage) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>Edit</Button>
        ) : (
          <Button onClick={() => setOpen(true)}>Add Project</Button>
        )
      } />

      <SheetContent className="p-0 overflow-y-auto sm:max-w-md flex flex-col">
        {/* ── Prominent Header ── */}
        <div className={`p-6 ${isEditing ? "bg-gradient-to-br from-slate-700 to-slate-900" : "bg-gradient-to-br from-rose-600 to-rose-800"}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white/20 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{isEditing ? "Edit Project" : "Add New Project"}</h2>
              <p className="text-white/70 text-sm">{isEditing ? `Editing: ${project?.projectName}` : "Fill in the project details below"}</p>
            </div>
          </div>
        </div>

        {/* ── Form Body ── */}
        <div className="flex-1 bg-slate-50 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Section: General */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">General</p>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  <div className="p-3">
                    <FormField control={form.control} name="projectName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Name *</FormLabel>
                        <FormControl><Input {...field} className={inputCls} placeholder="Q1 Audit" disabled={!canManage} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-100">
                    <div className="p-3">
                      <FormField control={form.control} name="projectCode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Code</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="PRJ-01" disabled={!canManage} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="p-3">
                      <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</FormLabel>
                          <FormControl>
                            <select {...field} className={selectCls} disabled={!canManage}>
                              <option value="ACTIVE">Active</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="ON_HOLD">On Hold</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="clientId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Client *</FormLabel>
                        <FormControl>
                          <select {...field} className={selectCls} disabled={!canManage}>
                            <option value="" disabled>Select a Client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.clientName}</option>)}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Section: Timeline */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Timeline</p>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-2 divide-x divide-slate-100">
                    <div className="p-3">
                      <FormField control={form.control} name="projectStartDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Start Date</FormLabel>
                          <FormControl><Input type="date" {...field} value={field.value || ""} className={inputCls} disabled={!canManage} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="p-3">
                      <FormField control={form.control} name="projectEndDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">End Date</FormLabel>
                          <FormControl><Input type="date" {...field} value={field.value || ""} className={inputCls} disabled={!canManage} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Details & WO */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Work Order & Details</p>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-2 divide-x divide-slate-100">
                    <div className="p-3">
                      <FormField control={form.control} name="workOrderNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WO Number</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="WO-1234" disabled={!canManage} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="p-3">
                      <FormField control={form.control} name="workOrderDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WO Date</FormLabel>
                          <FormControl><Input type="date" {...field} value={field.value || ""} className={inputCls} disabled={!canManage} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="sacCategory" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">SAC Category</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="998231" disabled={!canManage} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="Brief project description" disabled={!canManage} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-3">
                    <FormField control={form.control} name="projectAddress" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Address</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} className={inputCls} placeholder="123 Site Road" disabled={!canManage} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              {canManage && (
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className={`flex-1 h-11 font-semibold rounded-lg ${isEditing ? "bg-slate-800 hover:bg-slate-900" : "bg-rose-600 hover:bg-rose-700"}`}
                  >
                    {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" className="h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg" onClick={() => setConfirmOpen(true)} disabled={form.formState.isSubmitting}>
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </form>
          </Form>
        </div>
      </SheetContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </Sheet>
  );
}
