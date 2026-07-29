import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, MapPin, Phone } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import { contactSchema, toFieldErrors, type FieldErrors } from "../lib/validation";
import { TextField, Field } from "../components/site/FormFields";

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
  const [touched, setTouched] = useState<Record<keyof Form, boolean>>({ name: false, email: false, phone: false, message: false });
  const [errors, setErrors] = useState<FieldErrors<Form>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (next: Form) => {
    const r = contactSchema.safeParse(next);
    if (r.success) {
      setErrors({});
      return true;
    }
    setErrors(toFieldErrors<Form>(r.error));
    return false;
  };

  const setField = <K extends keyof Form>(k: K, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    validate(next);
  };

  const isValid = useMemo(() => contactSchema.safeParse(form).success, [form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });
    if (!validate(form) || submitting) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Message sent — we'll be in touch shortly!");
      setForm({ name: "", email: "", phone: "", message: "" });
      setTouched({ name: false, email: false, phone: false, message: false });
    } catch {
      toast.error("Could not send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const msgStatus = !touched.message && !form.message ? "" : errors.message ? "border-pink/70 focus:ring-pink/40" : "border-emerald/60 focus:ring-emerald/40";

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
              <TextField
                label="Full name"
                autoComplete="name"
                value={form.name}
                onChange={(v) => setField("name", v)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                error={errors.name}
                touched={touched.name}
              />
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(v) => setField("email", v)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                error={errors.email}
                touched={touched.email}
              />
              <div className="sm:col-span-2">
                <TextField
                  label="Phone"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(v) => setField("phone", v.replace(/\D/g, "").slice(0, 10))}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  error={errors.phone}
                  touched={touched.phone}
                  hint="10 digits, no spaces"
                />
              </div>
            </div>
            <Field label="Message" error={touched.message ? errors.message : undefined}>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setField("message", e.target.value.slice(0, 1000))}
                onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                aria-invalid={touched.message && !!errors.message}
                className={`w-full bg-white/5 rounded-xl px-3 py-2.5 border transition-colors focus:outline-none focus:ring-2 resize-none ${msgStatus || "border-white/10 focus:ring-primary/60"}`}
              />
              <div className="text-[10px] text-muted-foreground mt-1 text-right">{form.message.length}/1000</div>
            </Field>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="rounded-2xl px-6 py-3 bg-grad-hero text-white font-semibold glow inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </Section>
    </PageShell>
  );
}
