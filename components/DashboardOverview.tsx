"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { SignalHistory, type SignalRow } from "@/components/SignalHistory";

type Stats = {
  totalSignals: number;
  sentSignals: number;
  averageConfidence: number;
};

export function DashboardOverview() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [stats, setStats] = useState<Stats>({
    totalSignals: 0,
    sentSignals: 0,
    averageConfidence: 0
  });
  const [latest, setLatest] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("signals")
        .select("id, created_at, signal_direction, confidence, should_send, telegram_status, webhook_payload")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const rows = (data ?? []) as SignalRow[];
      const totalSignals = rows.length;
      const sentSignals = rows.filter((signal) => signal.should_send).length;
      const averageConfidence =
        totalSignals > 0
          ? rows.reduce((sum, signal) => sum + Number(signal.confidence ?? 0), 0) / totalSignals
          : 0;

      setStats({ totalSignals, sentSignals, averageConfidence });
      setLatest(rows.slice(0, 5));
      setLoading(false);
    }

    load();
  }, [router, supabase]);

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Total signals", stats.totalSignals.toLocaleString(), "All saved webhook confirmations"],
          ["Sent signals", stats.sentSignals.toLocaleString(), "Signals delivered to Telegram"],
          ["Avg confidence", `${stats.averageConfidence.toFixed(0)}%`, "Across saved signals"]
        ].map(([label, value, helper]) => (
          <article className="panel p-5" key={label}>
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{loading ? "-" : value}</p>
            <p className="muted mt-2 text-sm">{helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black">Latest signals</h2>
            <p className="muted mt-1">Most recent AI-confirmed TradingView payloads.</p>
          </div>
          <Link className="btn btn-secondary" href="/signals">
            View all
          </Link>
        </div>
        {latest.length || loading ? <SignalHistory limit={5} /> : <SignalHistory limit={5} />}
      </section>
    </div>
  );
}
