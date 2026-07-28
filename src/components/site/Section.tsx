import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative py-20 md:py-28 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl mb-10 md:mb-14">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" /> {eyebrow}
            </div>
          )}
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            {title.split("|").map((p, i) =>
              i % 2 ? (
                <span key={i} className="text-grad-hero">
                  {p}
                </span>
              ) : (
                <span key={i}>{p}</span>
              ),
            )}
          </h2>
          {subtitle && <p className="mt-3 text-muted-foreground md:text-lg">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-purple/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-cyan/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-pink/20 blur-3xl" />
      </div>
      <main className="pt-24 md:pt-28 pb-8">{children}</main>
    </div>
  );
}
