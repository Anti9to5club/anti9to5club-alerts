import Link from "next/link";
import clsx from "clsx";

const variants = {
  primary:
    "bg-foreground text-white shadow-[0_18px_40px_rgba(16,14,12,0.18)] hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-[0_24px_50px_rgba(13,52,45,0.24)]",
  secondary:
    "border border-foreground/10 bg-white/82 text-foreground shadow-sm shadow-black/5 hover:-translate-y-0.5 hover:border-foreground/18 hover:bg-white",
  ghost:
    "text-foreground hover:bg-black/5"
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
  ...props
}) {
  const classes = clsx(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold tracking-[0.04em]",
    variants[variant],
    className
  );

  if (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http")
  ) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
