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
  
  if (user.needsPasswordChange) {
    redirect("/change-password");
  } else if (user.isSuperAdmin) {
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

export async function changePasswordAction(password: string) {
  const { getTenantSession } = await import("@/lib/auth");
  const { user } = await getTenantSession();
  if (!user) throw new Error("Unauthorized");

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash, needsPasswordChange: false }
  });

  if (user.isSuperAdmin) {
    redirect("/super-admin");
  } else {
    redirect("/");
  }
}

export async function requestPasswordResetAction(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("If an account exists, a reset email will be sent."); // don't expose if user exists

  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry }
  });

  const superAdminCred = await prisma.googleCredential.findFirst({
    where: { user: { isSuperAdmin: true } }
  });

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id }
  });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const emailBody = `Hello,\n\nYou have requested a password reset. Please click the link below to reset your password. This link is valid for 1 hour.\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`;

  try {
    if (superAdminCred && superAdminCred.userId) {
      const { sendSystemEmail } = await import('@/lib/gmail');
      await sendSystemEmail(superAdminCred.userId, email, "Password Reset Request", emailBody);
    } else if (member) {
      const { sendEmail } = await import('@/lib/gmail');
      await sendEmail(member.organizationId, email, "Password Reset Request", emailBody, false);
    } else {
      console.warn(`User ${email} has no organization and no system email is configured.`);
      throw new Error("Cannot send email: system is not configured and user has no organization.");
    }
  } catch (e: any) {
    console.error("Failed to send reset email:", e);
    throw new Error(e.message || "Failed to send reset email. Please contact administrator.");
  }
}

export async function resetPasswordWithTokenAction(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: { 
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  });

  if (!user) {
    throw new Error("Invalid or expired reset token.");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      passwordHash: hash, 
      resetToken: null, 
      resetTokenExpiry: null,
      needsPasswordChange: false 
    }
  });

  redirect("/login");
}
