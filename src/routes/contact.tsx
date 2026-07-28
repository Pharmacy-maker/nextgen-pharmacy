import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import { contactSchema, toFieldErrors, type FieldErrors } from "../lib/validation";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Rays Pharmacy" },
      { name: "description", content: "Get in touch with the Rays Pharmacy team for support, partnerships or press." },
      { property: "og:title", content: "Contact — Rays Pharmacy" },
      { property: "og:description", content: "Send us a message — we usually reply within a few hours." },
    ],
  }),
});

type Form = { name: string; email: string; phone: string; message: string };

function ContactPage() {
  const [form, setForm] = useState<Form>({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors<Form>>({});

  const update = <K extends keyof Form>(k: K, v: Form[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    const r = contactSchema.safeParse(next);
    if (r.success) setErrors({});
    else {
      const map = toFieldErrors<Form>(r.error);
      setErrors((prev) => ({ ...prev, [k]: map[k] }));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = contactSchema.safeParse(form);
    if (!r.success) return setErrors(toFieldErrors<Form>(r.error));
    toast.success("Message sent — we'll be in touch shortly!");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <PageShell>
      <Section eyebrow="Say hello" title="Contact | Us |" subtitle="Questions, feedback or partnerships — we'd love to hear from you.">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-3">
            {[
              { i: Phone, t: "+91 90000 00000", s: "Mon – Sun • 8am – 10pm" },
              { i: Mail, t: "support@rayspharmacy.com", s: "Reply within a few hours" },
              { i: MapPin, t: "Bengaluru, India", s: "HQ & pharmacy hub" },
            ].map((c) => {
              const Icon = c.i;
              return (
                <div key={c.t} className="glass rounded-2xl p-4 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-grad-cool grid place-items-center shrink-0">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">{c.t}</div>
                    <div className="text-xs text-muted-foreground">{c.s}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={submit} className="lg:col-span-2 glass rounded-3xl p-6 space-y-3" noValidate>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full name" error={errors.name}>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls(!!errors.name)} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls(!!errors.email)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Phone" error={errors.phone}>
                  <input inputMode="numeric" value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className={inputCls(!!errors.phone)} />
                </Field>
              </div>
            </div>
            <Field label="Message" error={errors.message}>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => update("message", e.target.value.slice(0, 1000))}
                className={inputCls(!!errors.message) + " resize-none"}
              />
              <div className="text-[10px] text-muted-foreground mt-1 text-right">{form.message.length}/1000</div>
            </Field>
            <button type="submit" className="rounded-2xl px-6 py-3 bg-grad-hero text-white font-semibold glow">
              Send message
            </button>
          </form>
        </div>
      </Section>
    </PageShell>
  );
}

function inputCls(hasError: boolean) {
  return `w-full bg-white/5 rounded-xl px-3 py-2.5 border ${hasError ? "border-pink/60" : "border-white/10"} focus:outline-none focus:ring-2 focus:ring-primary/60`;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted-foreground mb-1">{label}</span>
      {children}
      {error && <span className="block text-xs text-pink mt-1">{error}</span>}
    </label>
  );
}
