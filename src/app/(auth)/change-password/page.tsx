import { getTenantSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChangePasswordClient } from "./change-password-client";

export default async function ChangePasswordPage() {
  const { user } = await getTenantSession();
  if (!user) {
    redirect("/login");
  }
  
  // If the user somehow gets here but doesn't need a password change, send them away.
  if (!user.needsPasswordChange) {
    redirect("/dashboard");
  }

  return <ChangePasswordClient />;
}
