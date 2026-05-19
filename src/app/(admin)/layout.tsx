import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { signOut } from "./admin/login/actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const adminCSS = `
  .admin-shell { min-height: 100vh; display: grid; grid-template-columns: 220px 1fr; background: #F4F5F7; color: #1F2937; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }
  .admin-shell--full { grid-template-columns: 1fr; }
  .admin-side { background: #0D1B2A; color: #E5E7EB; padding: 24px 0; }
  .admin-brand { font-weight: 800; font-size: 1rem; padding: 0 20px 20px; color: #fff; border-bottom: 1px solid rgba(255,255,255,.08); margin-bottom: 16px; }
  .admin-nav { display: flex; flex-direction: column; }
  .admin-nav a { color: #cbd5e1; text-decoration: none; padding: 10px 20px; font-size: .9rem; }
  .admin-nav a:hover { background: rgba(255,255,255,.04); color: #fff; }
  .admin-main { padding: 0; }
  .admin-topbar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
  .admin-topbar .user { font-size: .85rem; color: #6B7280; }
  .admin-topbar form { display: inline; }
  .admin-topbar button { font-size: .85rem; background: none; border: 1px solid #D1D5DB; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #374151; }
  .admin-topbar button:hover { background: #F9FAFB; }
  .admin-content { padding: 24px; max-width: 1200px; }
  .admin-content h1 { font-size: 1.5rem; margin-bottom: 16px; }
  .admin-content h2 { font-size: 1.1rem; margin-top: 24px; margin-bottom: 12px; }
  .admin-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
  .admin-table th, .admin-table td { text-align: left; padding: 10px 12px; font-size: .85rem; border-bottom: 1px solid #F3F4F6; }
  .admin-table th { background: #F9FAFB; color: #6B7280; font-weight: 600; }
  .admin-table tr:last-child td { border-bottom: none; }
  .admin-table tr:hover td { background: #FAFBFC; }
  .admin-table a { color: #1B3A5C; text-decoration: none; font-weight: 600; }
  .admin-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: .75rem; font-weight: 600; text-transform: uppercase; }
  .admin-badge--new { background: #DBEAFE; color: #1E40AF; }
  .admin-badge--reviewed { background: #FEF3C7; color: #92400E; }
  .admin-badge--sent_to_company { background: #E0E7FF; color: #3730A3; }
  .admin-badge--company_replied { background: #DCFCE7; color: #166534; }
  .admin-badge--customer_contacted { background: #CFFAFE; color: #155E75; }
  .admin-badge--closed_won { background: #D1FAE5; color: #065F46; }
  .admin-badge--closed_lost { background: #FEE2E2; color: #991B1B; }
  .admin-badge--spam { background: #F3F4F6; color: #4B5563; }
  .admin-badge--duplicate { background: #F3F4F6; color: #4B5563; }
  .admin-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,.04); margin-bottom: 16px; }
  .admin-card dl { display: grid; grid-template-columns: 160px 1fr; gap: 8px 16px; font-size: .9rem; }
  .admin-card dt { color: #6B7280; }
  .admin-card dd { color: #111827; }
  .admin-form { display: flex; flex-direction: column; gap: 12px; }
  .admin-form label { font-size: .85rem; color: #374151; font-weight: 600; }
  .admin-form input, .admin-form select, .admin-form textarea { width: 100%; padding: 8px 12px; font-size: .9rem; border: 1px solid #D1D5DB; border-radius: 6px; background: #fff; }
  .admin-form button { background: #1B3A5C; color: #fff; padding: 10px 20px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
  .admin-form button:disabled { background: #9CA3AF; cursor: not-allowed; }
  .admin-form button:hover:not(:disabled) { background: #0D1B2A; }
  .admin-error { background: #FEE2E2; color: #991B1B; padding: 10px 14px; border-radius: 6px; font-size: .85rem; border: 1px solid #FECACA; }
  .admin-notice { background: #FEF3C7; color: #92400E; padding: 10px 14px; border-radius: 6px; font-size: .85rem; border: 1px solid #FDE68A; }
  .admin-success { background: #D1FAE5; color: #065F46; padding: 10px 14px; border-radius: 6px; font-size: .85rem; border: 1px solid #A7F3D0; }
  .admin-filter-bar { display: flex; gap: 12px; align-items: end; margin-bottom: 16px; padding: 12px; background: #fff; border-radius: 8px; }
  .admin-filter-bar select { padding: 6px 10px; font-size: .85rem; border: 1px solid #D1D5DB; border-radius: 6px; }
  .admin-timeline { list-style: none; padding: 0; }
  .admin-timeline li { padding: 12px 16px; background: #fff; border-radius: 6px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.04); font-size: .85rem; }
  .admin-timeline .ev-title { font-weight: 600; color: #111827; }
  .admin-timeline .ev-meta { color: #6B7280; font-size: .75rem; margin-top: 4px; }
  .admin-timeline .ev-change { color: #374151; margin-top: 4px; font-family: ui-monospace, monospace; font-size: .75rem; }
  .admin-login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #F4F5F7; padding: 24px; }
  .admin-login-card { background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,.06); width: 100%; max-width: 400px; }
  .admin-login-card h1 { font-size: 1.25rem; margin-bottom: 4px; color: #111827; }
  .admin-login-card p.sub { font-size: .85rem; color: #6B7280; margin-bottom: 20px; }
  .admin-login-card .toggle { background: none; border: none; color: #1B3A5C; font-size: .85rem; cursor: pointer; padding: 0; margin-top: 12px; text-decoration: underline; }
`;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div lang="en" dir="ltr">
      <style dangerouslySetInnerHTML={{ __html: adminCSS }} />
      {session ? (
        <div className="admin-shell">
          <aside className="admin-side">
            <div className="admin-brand">Admin</div>
            <nav className="admin-nav">
              <Link href="/admin/leads">Leads</Link>
            </nav>
          </aside>
          <div className="admin-main">
            <div className="admin-topbar">
              <div className="user">{session.email} · <strong>{session.role}</strong></div>
              <form action={signOut}>
                <button type="submit">Sign out</button>
              </form>
            </div>
            <div className="admin-content">{children}</div>
          </div>
        </div>
      ) : (
        <div className="admin-shell admin-shell--full">
          <div className="admin-main">
            <div className="admin-content" style={{ padding: 0 }}>{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
