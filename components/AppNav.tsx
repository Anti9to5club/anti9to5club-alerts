import Link from "next/link";

export function AppNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="shell flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
        <Link href="/" className="font-black tracking-tight text-slate-950">
          Anti9to5Club Alerts
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/settings">
            Settings
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/signals">
            History
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/tradingview">
            TradingView
          </Link>
          <Link className="btn btn-primary" href="/login">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
