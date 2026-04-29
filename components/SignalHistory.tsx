"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export type SignalRow = {
  id: string;
  created_at: string;
  signal_direction: string;
  confidence: number;
  should_send: boolean;
  telegram_status: string;
  webhook_payload: { symbol?: string; ticker?: string; timeframe?: string };
};

function statusClass(status: string) {
  if (status === "sent") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "failed") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export function SignalHistory({ limit }: { limit?: number }) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      let query = supabase
        .from("signals")
        .select("id, created_at, signal_direction, confidence, should_send, telegram_status, webhook_payload")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (limit) query = query.limit(limit);

      const { data } = await query;
      setSignals((data ?? []) as SignalRow[]);
      setLoading(false);
    }

    load();
  }, [limit, router, supabase]);

  if (loading) {
    return <div className="panel p-6 text-sm font-semibold text-slate-500">Loading signals...</div>;
  }

  if (!signals.length) {
    return (
      <div className="panel p-6">
        <h2 className="text-xl font-black">No signals yet</h2>
        <p className="muted mt-2">Saved TradingView signals will appear here after your webhook receives alerts.</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Symbol</th>
              <th className="px-5 py-4">Direction</th>
              <th className="px-5 py-4">Confidence</th>
              <th className="px-5 py-4">Should send</th>
              <th className="px-5 py-4">Telegram</th>
              <th className="px-5 py-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {signals.map((signal) => (
              <tr className="bg-white hover:bg-slate-50" key={signal.id}>
                <td className="px-5 py-4 font-bold text-slate-950">
                  {signal.webhook_payload?.symbol ?? signal.webhook_payload?.ticker ?? "Unknown"}
                </td>
                <td className="px-5 py-4 capitalize text-slate-700">{signal.signal_direction}</td>
                <td className="px-5 py-4">
                  <span className="font-bold text-slate-950">{Number(signal.confidence).toFixed(0)}%</span>
                </td>
                <td className="px-5 py-4">
                  <span className={signal.should_send ? "font-bold text-emerald-700" : "font-bold text-slate-500"}>
                    {signal.should_send ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusClass(signal.telegram_status)}`}>
                    {signal.telegram_status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">{new Date(signal.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
