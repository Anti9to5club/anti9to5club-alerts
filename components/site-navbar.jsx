"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { CTAButton } from "@/components/cta-button";
import { navigationLinks } from "@/lib/site-content";

export function SiteNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[88rem] rounded-full border border-white/60 bg-surface/82 px-4 py-3 shadow-lg backdrop-blur-xl md:px-7">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-4"
            onClick={() => setIsOpen(false)}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-sm font-bold tracking-[0.2em] text-white shadow-lg shadow-black/10">
              LP
            </span>
            <div>
              <p className="font-display text-[1.45rem] leading-none text-foreground">
                LaunchPoint
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-soft">
                Websites / Automation / AI
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1.5 rounded-full border border-foreground/6 bg-white/45 px-2 py-2 lg:flex">
            {navigationLinks.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-full px-4 py-2.5 text-sm font-medium",
                    active
                      ? "bg-foreground text-white shadow-sm shadow-black/10"
                      : "text-foreground/75 hover:bg-black/5 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <CTAButton href="/contact">Book a Call</CTAButton>
          </div>

          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-white/80 text-foreground lg:hidden"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>
        </div>

        <div
          className={clsx(
            "grid overflow-hidden transition-all duration-300 lg:hidden",
            isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <nav className="flex flex-col gap-2 border-t border-foreground/8 pt-4">
              {navigationLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-2xl px-4 py-3.5 text-sm font-medium",
                    pathname === item.href
                      ? "bg-foreground text-white"
                      : "bg-white/50 text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <CTAButton href="/contact" className="mt-2" onClick={() => setIsOpen(false)}>
                Book a Call
              </CTAButton>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
