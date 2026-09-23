"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations";
import * as z from "zod";

export async function loginAction(data: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.parse(data);

  const user = await prisma.user.findUnique({
    where: { email: parsed.email }
  });

  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(parsed.password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  await createSession(user.id);
  
  if (user.isSuperAdmin) {
    redirect("/super-admin");
  } else {
    redirect("/");
  }
}

// Register action has been removed in favor of superadmin provisioning

export async function logoutAction() {
  const { clearSession } = await import("@/lib/auth");
  await clearSession();
  redirect("/login");
}
