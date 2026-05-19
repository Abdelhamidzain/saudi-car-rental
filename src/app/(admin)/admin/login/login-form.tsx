"use client";

import { useState, useTransition } from "react";
import { signIn, signUp } from "./actions";

type Mode = "signin" | "signup";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const fn = mode === "signin" ? signIn : signUp;
      const result = await fn(formData);
      if (!result.ok) {
        setError(result.error);
      } else if (mode === "signup") {
        setSuccess(
          "Account created. An administrator must promote your role before you can access the dashboard.",
        );
      }
      // signIn redirects on success; nothing else to do here.
    });
  }

  return (
    <form className="admin-form" action={onSubmit}>
      <div>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" name="email" type="email" autoComplete="email" required disabled={pending} />
      </div>
      <div>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          minLength={mode === "signin" ? 6 : 8}
          required
          disabled={pending}
        />
      </div>
      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}
      <button type="submit" disabled={pending}>
        {pending ? (mode === "signin" ? "Signing in…" : "Creating account…") : (mode === "signin" ? "Sign in" : "Create account")}
      </button>
      <button
        type="button"
        className="toggle"
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setSuccess(null); }}
      >
        {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </button>
    </form>
  );
}
