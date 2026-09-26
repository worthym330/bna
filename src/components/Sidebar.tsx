import Link from "next/link"
import { logoutAction } from "@/app/actions/auth"
import { getTenantSession } from "@/lib/auth"

export async function Sidebar() {
  const { user, organization } = await getTenantSession();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex-shrink-0 min-h-screen">
      <div className="p-4 text-xl font-bold border-b border-slate-800">
        {user.isSuperAdmin ? "BNA Super Admin" : organization?.displayName || "BNA Billing"}
      </div>
      <nav className="mt-4 px-2 space-y-1 flex-1">
        {user.isSuperAdmin ? (
          <>
            <Link href="/super-admin" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Organizations & Users
            </Link>
            <Link href="/settings/audit-logs" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Global Audit Logs
            </Link>
          </>
        ) : (
          <>
            <Link href="/" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Dashboard
            </Link>
            <Link href="/organization" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Organization Profile
            </Link>
            <Link href="/clients" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Clients
            </Link>
            <Link href="/invoices" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Invoices
            </Link>
            <Link href="/credit-notes" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Credit Notes
            </Link>
            <Link href="/projects" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Projects
            </Link>
            <Link href="/offices" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Offices
            </Link>
            <Link href="/settings" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Settings
            </Link>
            <Link href="/settings/templates" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Templates
            </Link>
            <Link href="/settings/audit-logs" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Audit Logs
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 text-sm text-red-400 rounded-md hover:bg-slate-800 transition-colors"
          >
            Log Out
          </button>
        </form>
      </div>
    </aside>
  )
}
