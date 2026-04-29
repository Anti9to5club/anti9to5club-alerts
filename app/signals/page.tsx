import { AppNav } from "@/components/AppNav";
import { SignalHistory } from "@/components/SignalHistory";

export default function SignalsPage() {
  return (
    <>
      <AppNav />
      <main className="shell grid gap-6 py-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Signal history</h1>
          <p className="muted mt-2">Saved signals from Supabase, including rejected and Telegram-delivered alerts.</p>
        </div>
        <SignalHistory />
      </main>
    </>
  );
}
