"use server";

import { redirect } from "next/navigation";
import { getSupabaseAuthClient } from "@/lib/supabase/server-auth";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string };

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isEmail(email) || password.length < 6) {
    return { ok: false, error: "Enter a valid email and password (≥ 6 chars)." };
  }

  const supabase = await getSupabaseAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: "Invalid email or password." };
  }
  redirect("/admin/leads");
}

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isEmail(email) || password.length < 8) {
    return { ok: false, error: "Enter a valid email and password (≥ 8 chars)." };
  }

  const supabase = await getSupabaseAuthClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { ok: false, error: error.message || "Sign-up failed." };
  }
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login?reason=signout");
}
