import * as z from "zod";

export const createOrgSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  displayName: z.string().min(1, "Display name is required"),
});

export const createUserSchema = z.object({
  organizationId: z.string().min(1, "Organization is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const orgProfileSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email("Invalid email").or(z.literal("")).nullable(),
  phone: z.string().nullable().optional(),
  website: z.string().url("Invalid URL").or(z.literal("")).nullable(),
  pan: z.string().nullable().optional(),
  gstin: z.string().nullable().optional(),
  defaultCurrency: z.string().min(1, "Currency is required"),
  defaultCountry: z.string().min(1, "Country is required"),
});

export const clientSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientCode: z.string().nullable().optional(),
  email: z.string().email("Invalid email").or(z.literal("")).nullable(),
  phone: z.string().nullable().optional(),
  gstin: z.string().nullable().optional(),
  pan: z.string().nullable().optional(),
});

export const officeSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteCode: z.string().nullable().optional(),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().nullable().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().nullable().optional(),
  gstin: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  contactEmail: z.string().email("Invalid email").or(z.literal("")).nullable(),
});

export const projectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectCode: z.string().nullable().optional(),
  projectAddress: z.string().nullable().optional(),
  workOrderNumber: z.string().nullable().optional(),
  workOrderDate: z.string().nullable().optional(),
  projectStartDate: z.string().nullable().optional(),
  projectEndDate: z.string().nullable().optional(),
  sacCategory: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  clientId: z.string().min(1, "Client is required"),
  status: z.string().min(1, "Status is required"),
});
