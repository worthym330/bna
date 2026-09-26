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
import { createClient, updateClient, deleteClient } from "@/app/actions/clients";
import { clientSchema } from "@/lib/validations";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Client = {
  id: string;
  clientName: string;
  clientCode: string | null;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  pan: string | null;
};

export function ClientSheet({ client }: { client?: Client }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isEditing = !!client;

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientName: client?.clientName || "",
      clientCode: client?.clientCode || "",
      email: client?.email || "",
      phone: client?.phone || "",
      gstin: client?.gstin || "",
      pan: client?.pan || "",
    },
  });

  async function onSubmit(values: z.infer<typeof clientSchema>) {
    try {
      if (isEditing) {
        await updateClient(client.id, values);
      } else {
        await createClient(values);
      }
      setOpen(false);
      toast.success(isEditing ? "Client updated successfully!" : "Client created successfully!");
      if (!isEditing) form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save client");
    }
  }

  async function handleDelete() {
    try {
      await deleteClient(client!.id);
      setOpen(false);
      toast.success("Client deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete client");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={isEditing ? <Button variant="ghost" size="sm" /> : <Button />}>
        {isEditing ? "Edit" : "Add Client"}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Client" : "Add Client"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update the details for this client." : "Enter the details for the new client."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Code</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 flex items-center justify-between">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Client"}
              </Button>
              {isEditing && (
                <Button type="button" variant="destructive" onClick={() => setConfirmOpen(true)} disabled={form.formState.isSubmitting}>
                  Delete
                </Button>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </Sheet>
  );
}
