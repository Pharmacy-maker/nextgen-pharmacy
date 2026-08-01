import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useMemo, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageShell, Section } from "../components/site/Section";
import { ConfirmPasswordField, PasswordField } from "../components/site/FormFields";
import { passwordSchema } from "../lib/validation";
import { authService } from "../lib/api";

const searchSchema = z.object({
  token: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: zodValidator(searchSchema),
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset Password — Rays Pharmacy" },
      { name: "description", content: "Choose a new password for your Rays Pharmacy account." },
      { property: "og:title", content: "Reset Password — Rays Pharmacy" },
      { property: "og:description", content: "Set a new, strong password for your Rays Pharmacy account." },
    ],
  }),
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const passwordError = useMemo(() => {
    const r = passwordSchema.safeParse(password);
    return r.success ? undefined : r.error.issues[0]?.message;
  }, [password]);

  const isValid = !passwordError && confirm === password && confirm.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      toast.success("Password updated. Please log in.");
    } catch (err) {
      toast.error((err as Error).message || "Could not reset your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <Section eyebrow="Account recovery" title="Set a new | password |" subtitle="Choose a strong password you haven't used before.">
        <div className="glass rounded-3xl p-6 md:p-8 max-w-md mx-auto">
          {!token ? (
            <div className="text-center">
              <div className="text-lg font-semibold">Reset link missing</div>
              <p className="text-sm text-muted-foreground mt-2">
                This page needs a valid reset link. Request a new one to continue.
              </p>
              <Link to="/forgot-password" className="mt-5 inline-block rounded-2xl px-5 py-3 bg-grad-hero text-white font-semibold glow">
                Request new link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-grad-neon grid place-items-center mx-auto mb-4 glow">
                <CheckCircle2 className="h-7 w-7 text-black" />
              </div>
              <div className="text-lg font-semibold">Password updated</div>
              <p className="text-sm text-muted-foreground mt-2">You can now sign in with your new password.</p>
              <button
                type="button"
                onClick={() => navigate({ to: "/login" })}
                className="mt-5 w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow"
              >
                Go to login
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3" noValidate>
              <PasswordField
                label="New password"
                value={password}
                onChange={setPassword}
                error={touched.password ? passwordError : undefined}
                touched={touched.password}
                autoComplete="new-password"
              />
              <ConfirmPasswordField
                value={confirm}
                onChange={setConfirm}
                original={password}
                touched={touched.confirm}
              />
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </Section>
    </PageShell>
  );
}
