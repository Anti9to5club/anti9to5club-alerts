import Link from "next/link";
import { AppNav } from "@/components/AppNav";

export default function LandingPage() {
  const steps = [
    "TradingView sends the alert",
    "AI confirms the setup quality",
    "Low-quality alerts are filtered out",
    "Approved signals are sent to Telegram",
    "Every signal is saved in your dashboard"
  ];

  return (
    <>
      <AppNav />
      <main>
        <section className="bg-[var(--navy)] text-white">
          <div className="shell grid min-h-[calc(100vh-64px)] gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">AI-confirmed trade signal scanner</p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                AI filters your TradingView alerts so only high-conviction setups reach your Telegram.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Anti9to5Club Alerts checks your TradingView webhook against your market, session, timeframe, and setup rules before sending the signal. Bad alerts get filtered. Clean setups get delivered instantly.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn btn-primary" href="/tradingview">Connect TradingView</Link>
                <Link className="btn border border-white/20 bg-white/10 text-white" href="/dashboard">View Dashboard</Link>
              </div>
              <p className="disclaimer mt-8 max-w-3xl rounded-md p-4 text-sm">
                Anti9to5Club Alerts is an informational signal scanner. It does not provide financial advice, does not manage accounts, and never places trades.
              </p>
            </div>
            <div className="panel border-slate-700 bg-slate-900 p-5 text-white shadow-2xl">
              <div className="rounded-md border border-slate-700 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-300">Live confirmation preview</p>
                  <span className="rounded-md bg-teal-500/20 px-2 py-1 text-xs font-bold text-teal-200">No execution</span>
                </div>
                <div className="mt-6 grid gap-3">
                  {[
                    ["Direction", "LONG"],
                    ["Confidence", "84%"],
                    ["Entry zone", "64220 - 64280"],
                    ["Stop loss", "63940"],
                    ["Targets", "64750, 65120"]
                  ].map(([label, value]) => (
                    <div className="flex justify-between rounded-md border border-slate-800 bg-slate-900 p-3" key={label}>
                      <span className="text-slate-400">{label}</span>
                      <span className="font-bold">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 rounded-md bg-blue-500/10 p-4 text-sm leading-6 text-blue-100">
                  Reasoning: Alert matches NY session, selected timeframe, and liquidity sweep setup. Risk levels are defined before delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--navy)] pb-16 text-white">
          <div className="shell">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/10 md:p-8">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">How it works</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                    From noisy alerts to cleaner Telegram signals.
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-300">
                  Keep your TradingView strategy. Anti9to5Club Alerts adds an AI quality gate before anything reaches your Telegram.
                </p>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-5">
                {steps.map((step, index) => (
                  <article className="rounded-md border border-white/10 bg-slate-950/60 p-4" key={step}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <p className="mt-4 text-sm font-bold leading-6 text-white">{step}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="shell grid gap-5 py-14 md:grid-cols-3">
          {[
            ["Webhook-first", "Use /api/webhook/tradingview as the inbound TradingView endpoint."],
            ["AI confirmation", "OpenAI returns structured JSON for direction, confidence, risk levels, and delivery decision."],
            ["Telegram alerts", "Only confirmed signals are delivered, and every signal is saved for audit history."]
          ].map(([title, text]) => (
            <article className="panel p-6" key={title}>
              <h2 className="text-xl font-black">{title}</h2>
              <p className="muted mt-3 leading-7">{text}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
