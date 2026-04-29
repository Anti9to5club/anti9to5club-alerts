export function PortfolioCard({ title, summary, stats, index }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/60 bg-surface/94 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-foreground/8 bg-gradient-to-br from-[#efe5d6] via-white to-surface-strong">
        <div className="absolute inset-5 rounded-[1.6rem] border border-white/70 bg-white/70 p-5 shadow-lg shadow-black/5 transition-transform duration-300 group-hover:scale-[1.015]">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
              Project {index + 1}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-soft">
              Placeholder Visual
            </span>
          </div>
          <div className="mt-7 space-y-3">
            <div className="h-4 w-2/3 rounded-full bg-foreground/10" />
            <div className="h-4 w-full rounded-full bg-foreground/8" />
            <div className="h-4 w-5/6 rounded-full bg-foreground/8" />
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="h-24 rounded-2xl bg-accent/10" />
            <div className="h-24 rounded-2xl bg-foreground/6" />
            <div className="h-24 rounded-2xl bg-[#d9ccba]" />
          </div>
        </div>
      </div>

      <div className="p-7 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-soft">
          {stats}
        </p>
        <h3 className="mt-4 text-[1.9rem] leading-tight">{title}</h3>
        <p className="mt-4 text-base leading-8">{summary}</p>
      </div>
    </article>
  );
}
