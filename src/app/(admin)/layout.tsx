import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";
import { getSession } from "@/lib/auth/get-session";
import { signOut } from "./admin/login/actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return (
      <div lang="en" dir="ltr" className="admin-root">
        <div className="admin-shell admin-shell--bare">
          <div className="admin-main">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div lang="en" dir="ltr" className="admin-root">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-brand">
            Admin<span className="dot" aria-hidden="true" />
          </div>
          <nav className="admin-nav" aria-label="Admin navigation">
            <Link href="/admin/leads">Leads</Link>
            <Link href="/admin/companies">Companies</Link>
          </nav>
          <div className="admin-side-foot">Saudi Car Rental — MVP</div>
        </aside>

        <div className="admin-main">
          <div className="admin-topbar">
            <div className="admin-topbar-title">Dashboard</div>
            <div className="admin-topbar-right">
              <span className="admin-topbar-email">{session.email}</span>
              <span className="admin-role-pill">{session.role}</span>
              <form action={signOut}>
                <button type="submit" className="admin-ghost-btn">Sign out</button>
              </form>
            </div>
          </div>
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
