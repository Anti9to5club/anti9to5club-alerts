import { AppNav } from "@/components/AppNav";
import { SettingsForm } from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <AppNav />
      <main className="shell grid gap-6 py-10 lg:grid-cols-[1fr_0.55fr]">
        <SettingsForm />
        <aside className="grid gap-4 self-start">
          <div className="panel p-5">
            <h2 className="text-xl font-black">Webhook endpoint</h2>
            <p className="muted mt-2 text-sm leading-6">Paste this endpoint into TradingView:</p>
            <code className="mt-3 block overflow-auto rounded-md bg-slate-950 p-3 text-sm text-white">
              /api/webhook/tradingview
            </code>
          </div>
          <div className="disclaimer rounded-md p-4 text-sm leading-6">
            Anti9to5Club Alerts is not financial advice. It confirms and logs alert context only, and it does not place trades.
          </div>
        </aside>
      </main>
    </>
  );
}
