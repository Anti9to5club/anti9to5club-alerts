import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="shell grid min-h-screen items-center gap-8 py-12 lg:grid-cols-[0.85fr_1.15fr]">
      <section>
        <Link className="text-sm font-black text-blue-700" href="/">Anti9to5Club Alerts</Link>
        <h1 className="mt-5 text-5xl font-black tracking-tight">Signals confirmed, never executed.</h1>
        <p className="muted mt-5 max-w-xl leading-8">
          Log in to configure markets, sessions, setup filters, confidence thresholds, and Telegram delivery.
        </p>
      </section>
      <AuthForm />
    </main>
  );
}
