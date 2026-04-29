import Link from "next/link";
import { contactDetails, navigationLinks } from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="px-4 pb-8 pt-20 sm:px-7 lg:px-10">
      <div className="container-shell">
        <div className="section-card relative overflow-hidden px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
          <div className="subtle-divider" />

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="eyebrow">LaunchPoint</span>
              <h2 className="mt-6 max-w-2xl text-4xl leading-tight sm:text-5xl">
                Professional websites, smarter systems, and AI tools that help
                businesses grow.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8">
                LaunchPoint is the parent company behind ServiceLineAI. We build
                practical digital systems that make businesses easier to find,
                easier to trust, and easier to run.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-soft">
                  Navigation
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  {navigationLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium text-foreground/80 hover:translate-x-0.5 hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-soft">
                  Contact
                </p>
                <div className="mt-5 space-y-3 text-sm text-foreground/80">
                  <p>{contactDetails.phone}</p>
                  <p>{contactDetails.email}</p>
                  <p>{contactDetails.location}</p>
                  <p className="pt-3 text-muted">
                    {/* Replace these placeholder contact details with your real info. */}
                    Available for new client work and ServiceLineAI demos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-foreground/8 pt-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>LaunchPoint</p>
            <p>Clean systems. Better response. Practical growth.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
