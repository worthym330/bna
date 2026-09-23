"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { updateOrganizationProfile } from "@/app/actions/organization";
import { orgProfileSchema } from "@/lib/validations";

type Organization = {
  legalName: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  pan: string | null;
  gstin: string | null;
  defaultCurrency: string;
  defaultCountry: string;
};

export function OrgProfileForm({ organization }: { organization: Organization }) {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof orgProfileSchema>>({
    resolver: zodResolver(orgProfileSchema),
    defaultValues: {
      legalName: organization.legalName,
      displayName: organization.displayName,
      email: organization.email || "",
      phone: organization.phone || "",
      website: organization.website || "",
      pan: organization.pan || "",
      gstin: organization.gstin || "",
      defaultCurrency: organization.defaultCurrency,
      defaultCountry: organization.defaultCountry,
    },
  });

  async function onSubmit(values: z.infer<typeof orgProfileSchema>) {
    setGlobalError(null);
    setSuccess(null);
    try {
      const result = await updateOrganizationProfile(values);
      if (result.success) {
        setSuccess("Organization profile updated successfully.");
      }
    } catch (error) {
      setGlobalError("Failed to update organization profile.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {globalError && (
          <div className="p-3 text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-md">
            {globalError}
          </div>
        )}
        {success && (
          <div className="p-3 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="legalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
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
            name="defaultCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Currency</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Country</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Form>
  );
}
