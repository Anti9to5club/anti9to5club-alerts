"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { CTAButton } from "@/components/cta-button";
import { navigationLinks } from "@/lib/site-content";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-full border border-white/60 bg-surface/85 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-bold tracking-[0.2em] text-white">
              LP
            </span>
            <div>
              <p className="font-display text-xl text-foreground">LaunchPoint</p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-soft">
                Websites • Automation • AI
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigationLinks.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-full px-4 py-2 text-sm font-medium",
                    active
                      ? "bg-foreground text-white"
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-white/70 text-foreground lg:hidden"
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
                    "rounded-2xl px-4 py-3 text-sm font-medium",
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
