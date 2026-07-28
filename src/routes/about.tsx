import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Rays Pharmacy" },
      { name: "description", content: "Rays Pharmacy blends AI, healthcare expertise and doorstep delivery for a modern pharmacy experience." },
      { property: "og:title", content: "About — Rays Pharmacy" },
      { property: "og:description", content: "Meet the team building the AI-powered pharmacy of tomorrow." },
    ],
  }),
});

function AboutPage() {
  const values = [
    { i: HeartPulse, t: "Care first", d: "Every prescription is reviewed by licensed pharmacists." },
    { i: ShieldCheck, t: "Verified supply", d: "Sourced only from certified manufacturers and distributors." },
    { i: Sparkles, t: "AI powered", d: "Smart prescription scanning, recommendations, and reminders." },
    { i: Award, t: "Loved by 2M+", d: "Trusted across 320+ cities with a 4.9★ average rating." },
  ];
  return (
    <PageShell>
      <Section eyebrow="Who we are" title="About | Rays Pharmacy |" subtitle="A modern pharmacy platform that combines pharmacists, AI, and lightning-fast delivery.">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="glass rounded-3xl p-6 md:p-8">
            <p className="text-muted-foreground leading-relaxed">
              Rays Pharmacy started with a simple mission: make healthcare feel effortless. From AI-powered prescription
              scanning to same-day delivery in 320+ cities, we're rebuilding the pharmacy experience for the digital age
              — without ever compromising on trust.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
                Explore products
              </Link>
              <Link to="/contact" className="rounded-xl px-5 py-2.5 glass hover:bg-white/15">
                Talk to us
              </Link>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1585421514738-01798e348b17?w=900&q=80&auto=format&fit=crop"
            alt="Modern pharmacy interior"
            className="rounded-3xl h-72 md:h-96 w-full object-cover"
          />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {values.map((v) => {
            const Icon = v.i;
            return (
              <div key={v.t} className="glass rounded-2xl p-5 hover-lift">
                <div className="h-10 w-10 rounded-xl bg-grad-cool grid place-items-center mb-3">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="font-semibold">{v.t}</div>
                <div className="text-sm text-muted-foreground mt-1">{v.d}</div>
              </div>
            );
          })}
        </div>
      </Section>
    </PageShell>
  );
}
