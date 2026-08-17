import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { PageShell, Section } from "../components/site/Section";
import { TextField } from "../components/site/FormFields";
import { emailSchema } from "../lib/validation";
import { authService } from "../lib/api";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Forgot Password — Rays Pharmacy" },
      { name: "description", content: "Reset your Rays Pharmacy account password with a secure single-use link." },
      { property: "og:title", content: "Forgot Password — Rays Pharmacy" },
      { property: "og:description", content: "Request a secure password reset link for your Rays Pharmacy account." },
    ],
  }),
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  

  const error = useMemo(() => {
    const r = emailSchema.safeParse(email);
    return r.success ? undefined : r.error.issues[0]?.message;
  }, [email]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (error || submitting) return;
    setSubmitting(true);
    try {
      const res = await authService.requestPasswordReset(email);
      setSent(true);
      
      toast.success("If that email is registered, a reset link is on its way.");
    } catch (err) {
      toast.error((err as Error).message || "Could not send the reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <Section eyebrow="Account recovery" title="Forgot your | password |?" subtitle="We'll email a secure single-use link to reset it.">
        <div className="glass rounded-3xl p-6 md:p-8 max-w-md mx-auto">
          {sent ? (
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-grad-cool grid place-items-center mx-auto mb-4 glow">
                <MailCheck className="h-7 w-7 text-white" />
              </div>
              <div className="text-lg font-semibold">Check your inbox</div>
              <p className="text-sm text-muted-foreground mt-2">
                If an account exists for <span className="text-foreground">{email}</span>, you'll receive a reset link
                valid for 30 minutes.
              </p>
              
              <Link to="/login" className="mt-3 block text-xs text-muted-foreground hover:text-foreground">
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3" noValidate>
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={setEmail}
                onBlur={() => setTouched(true)}
                error={error}
                touched={touched}
              />
              <button
                type="submit"
                disabled={!!error || submitting}
                className="w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending link…" : "Send reset link"}
              </button>
              <Link to="/login" className="block text-center text-xs text-muted-foreground hover:text-foreground">
                ← Back to login
              </Link>
            </form>
          )}
        </div>
      </Section>
    </PageShell>
  );
}
