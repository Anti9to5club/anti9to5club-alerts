import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { DashboardOverview } from "@/components/DashboardOverview";

export default function DashboardPage() {
  return (
    <>
      <AppNav />
      <main className="shell grid gap-8 py-10">
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Dashboard</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Anti9to5Club Alerts overview</h1>
            <p className="muted mt-4 max-w-3xl leading-8">
              Monitor total signals, Telegram delivery, average confidence, and the latest saved confirmations from Supabase.
            </p>
          </div>
          <div className="panel grid content-center gap-3 p-6">
            <Link className="btn btn-primary" href="/settings">Edit settings</Link>
            <Link className="btn btn-secondary" href="/signals">View signal history</Link>
            <Link className="btn btn-secondary" href="/tradingview">TradingView setup</Link>
          </div>
        </section>
        <DashboardOverview />
      </main>
    </>
  );
}
