"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

const fallbackSecret = "paste-your-webhook-secret-here";

export function TradingViewSetup() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [origin, setOrigin] = useState("https://your-domain.com");
  const [secret, setSecret] = useState(fallbackSecret);

  useEffect(() => {
    setOrigin(window.location.origin);

    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("user_settings")
        .select("webhook_secret")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.webhook_secret) setSecret(data.webhook_secret);
    }

    load();
  }, [router, supabase]);

  const webhookUrl = `${origin}/api/webhook/tradingview`;
  const examplePayload = {
    webhook_secret: secret,
    symbol: "{{ticker}}",
    timeframe: "{{interval}}",
    price: "{{close}}",
    market: "Forex",
    session: "NY",
    setup_type: "Liquidity sweep",
    direction: "long",
    notes: "TradingView alert context or strategy notes"
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="panel grid gap-6 p-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">TradingView setup</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Connect alerts to your AI scanner</h1>
          <p className="muted mt-3 max-w-3xl leading-8">
            Use this webhook URL and JSON alert body inside TradingView. Anti9to5Club Alerts will validate your secret,
            confirm the signal with OpenAI, save it to Supabase, and send Telegram only when approved.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-black">Webhook URL</h2>
          <code className="mt-3 block overflow-auto rounded-md bg-slate-950 p-4 text-sm text-white">{webhookUrl}</code>
        </div>

        <div>
          <h2 className="text-lg font-black">Example TradingView JSON payload</h2>
          <pre className="mt-3 overflow-auto rounded-md bg-slate-950 p-4 text-sm leading-6 text-white">
            {JSON.stringify(examplePayload, null, 2)}
          </pre>
        </div>
      </section>

      <aside className="grid gap-4 self-start">
        {[
          ["1. Create an alert", "Open TradingView, choose your symbol or strategy, then create a new alert."],
          ["2. Enable webhook URL", "In the alert dialog, turn on Webhook URL and paste the URL shown on this page."],
          ["3. Paste the JSON", "Paste the example JSON into the Message field and adjust market, session, setup type, or notes."],
          ["4. Save and test", "Trigger a test alert, then check Signal history for the saved confirmation result."]
        ].map(([title, text]) => (
          <article className="panel p-5" key={title}>
            <h3 className="font-black">{title}</h3>
            <p className="muted mt-2 text-sm leading-6">{text}</p>
          </article>
        ))}
        <div className="disclaimer rounded-md p-4 text-sm leading-6">
          Anti9to5Club Alerts is an informational scanner. It does not place trades and is not financial advice.
        </div>
      </aside>
    </div>
  );
}
