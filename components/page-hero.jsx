import clsx from "clsx";
import { CTAButton } from "@/components/cta-button";

export function PageHero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  panel,
  sectionClassName,
  contentClassName,
  titleClassName,
  descriptionClassName,
  panelClassName,
  primaryCtaClassName,
  secondaryCtaClassName
}) {
  return (
    <section className={clsx("container-shell section-pad pb-16 pt-12 sm:pt-16", sectionClassName)}>
      <div className="hero-grid">
        <div className={clsx("max-w-4xl pt-4", contentClassName)}>
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1
            className={clsx(
              "mt-7 max-w-4xl text-5xl leading-[0.96] sm:text-6xl lg:text-[5.25rem]",
              titleClassName
            )}
          >
            {title}
          </h1>
          <p
            className={clsx(
              "mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-[1.2rem]",
              descriptionClassName
            )}
          >
            {description}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            {primaryCta ? (
              <CTAButton
                href={primaryCta.href}
                className={clsx("sm:min-w-[11rem]", primaryCtaClassName)}
              >
                {primaryCta.label}
              </CTAButton>
            ) : null}
            {secondaryCta ? (
              <CTAButton
                href={secondaryCta.href}
                variant="secondary"
                className={clsx("sm:min-w-[11rem]", secondaryCtaClassName)}
              >
                {secondaryCta.label}
              </CTAButton>
            ) : null}
          </div>
        </div>

        <div className={clsx("section-card relative overflow-hidden p-7 sm:p-9 lg:p-10", panelClassName)}>
          <div className="subtle-divider" />
          {panel}
        </div>
      </div>
    </section>
  );
}
