import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";
import { Metadata } from "next";
import { getTenantSession } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  let orgName = "Invoq";
  try {
    const { organization, user } = await getTenantSession();
    if (user?.isSuperAdmin) {
      orgName = "Invoq Super Admin";
    } else if (organization?.displayName) {
      orgName = organization.displayName;
    }
  } catch (e) {
    // ignore if not logged in or invalid session
  }

  return {
    title: {
      template: `%s | ${orgName}`,
      default: orgName,
    }
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
