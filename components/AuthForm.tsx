"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createBrowserSupabase();
    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. Check your email if confirmation is enabled, then log in.");
      setMode("login");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={submit} className="panel grid gap-5 p-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="muted mt-2">
          Access your scanner settings, webhook secret, and confirmed signal history.
        </p>
      </div>
      <label className="label">
        Email
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="label">
        Password
        <input
          className="input"
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {message ? <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}
      <button className="btn btn-primary" disabled={loading} type="submit">
        {loading ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
      </button>
      <button
        className="text-sm font-bold text-blue-700"
        type="button"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
      </button>
    </form>
  );
}
