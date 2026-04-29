export function FeatureList({ items, columns = 2 }) {
  return (
    <div
      className={`grid gap-4 ${columns === 3 ? "lg:grid-cols-3" : "sm:grid-cols-2"}`}
    >
      {items.map((item) => (
        <div
          key={item}
          className="rounded-[1.6rem] border border-white/60 bg-white/72 p-5 shadow-sm shadow-black/5 transition-transform duration-300 hover:-translate-y-0.5"
        >
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-white">
              +
            </span>
            <p className="text-sm font-medium leading-6 text-foreground">{item}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
