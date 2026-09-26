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
    redirect("/dashboard");
  }
}

import { registerSchema } from "@/lib/validations";

export async function registerAction(data: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.parse(data);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email }
  });
  if (existing) throw new Error("Email already in use.");

  const hash = await bcrypt.hash(parsed.password, 10);

  const organization = await prisma.organization.create({
    data: {
      legalName: parsed.legalName,
      displayName: parsed.displayName,
    }
  });

  const newUser = await prisma.user.create({
    data: { 
      email: parsed.email, 
      name: parsed.name, 
      passwordHash: hash,
      needsPasswordChange: false
    }
  });

  await prisma.organizationMember.create({
    data: {
      userId: newUser.id,
      organizationId: organization.id,
      roleId: null, // Initial admin unrestricted
    }
  });

  await createSession(newUser.id);
  redirect("/dashboard");
}

export async function checkEmailExistsAction(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  return !!user;
}

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
    redirect("/dashboard");
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
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
      <p style="color: #334155; line-height: 1.6;">Hello,</p>
      <p style="color: #334155; line-height: 1.6;">You have requested to reset your password for your Invoq account. Please click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.6;">If the button above does not work, copy and paste the following link into your browser:<br>
      <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a></p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  try {
    const { sendSystemEmail, sendEmail } = await import('@/lib/gmail');
    
    if (superAdminCred && superAdminCred.userId) {
      await sendSystemEmail(superAdminCred.userId, email, "Password Reset Request", htmlBody);
    } else if (member) {
      await sendEmail(member.organizationId, email, "Password Reset Request", htmlBody, false);
    } else {
      // Fallback to SMTP for any user without an org and without superadmin setup
      console.warn(`User ${email} has no organization and no superadmin configured. Falling back to SMTP.`);
      await sendSystemEmail(null, email, "Password Reset Request", htmlBody);
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
