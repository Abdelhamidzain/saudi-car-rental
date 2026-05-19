import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();

  if (session && ["owner", "admin", "editor"].includes(session.role)) {
    redirect("/admin/leads");
  }

  const initialNotice = (() => {
    if (params.reason === "forbidden") {
      if (session) return "Access pending administrator approval. Ask the platform owner to grant you a role.";
      return "Access denied.";
    }
    if (params.reason === "signout") return "Signed out.";
    return null;
  })();

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          Admin<span className="dot" aria-hidden="true" />
        </div>
        <h1>Sign in</h1>
        <p className="sub">Authorised personnel only.</p>
        {initialNotice && (
          <div className={params.reason === "forbidden" ? "admin-notice" : "admin-success"} style={{ marginBottom: 14 }}>
            {initialNotice}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
