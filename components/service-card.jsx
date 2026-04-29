export function ServiceCard({ title, description, bullets }) {
  return (
    <article className="group section-card relative h-full overflow-hidden p-7 sm:p-8">
      <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
      <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-transform duration-300 group-hover:-translate-y-0.5">
        {title
          .split(" ")
          .slice(0, 2)
          .map((word) => word[0])
          .join("")}
      </div>
      <h3 className="mt-8 max-w-xs text-[1.85rem] leading-tight">{title}</h3>
      <p className="mt-4 max-w-md text-[1.02rem] leading-8">{description}</p>
      {bullets ? (
        <ul className="mt-8 space-y-4 border-t border-foreground/8 pt-7 text-sm leading-6 text-foreground/80">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-accent" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
