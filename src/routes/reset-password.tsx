import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageShell, Section } from "../components/site/Section";
import {
  ConfirmPasswordField,
  PasswordField,
} from "../components/site/FormFields";
import { passwordSchema } from "../lib/validation";
import { supabase } from "../lib/supabase";

const searchSchema = z.object({});

export const Route = createFileRoute("/reset-password")({
  validateSearch: zodValidator(searchSchema),
  component: ResetPasswordPage,

  head: () => ({
    meta: [
      { title: "Reset Password — Rays Pharmacy" },
      {
        name: "description",
        content: "Choose a new password for your Rays Pharmacy account.",
      },
      {
        property: "og:title",
        content: "Reset Password — Rays Pharmacy",
      },
      {
        property: "og:description",
        content: "Set a new, strong password for your Rays Pharmacy account.",
      },
    ],
  }),
});

function ResetPasswordPage() {
  
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [touched, setTouched] = useState({
    password: false,
    confirm: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [done, setDone] = useState(false);

  const passwordError = useMemo(() => {
    const result = passwordSchema.safeParse(password);

    return result.success
      ? undefined
      : result.error.issues[0]?.message;
  }, [password]);

  const isValid =
    !passwordError &&
    password.length > 0 &&
    confirm === password &&
    confirm.length > 0;

  /**
   * Supabase password recovery:
   *
   * The recovery email redirects back to this page with authentication
   * information in the URL/session. We listen for PASSWORD_RECOVERY and
   * also check the current session in case Supabase has already processed
   * the URL before this component mounted.
   */
  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      try {
        // First check whether Supabase already established the recovery session.
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!error && data.session) {
          setRecoveryReady(true);
          setCheckingRecovery(false);
          return;
        }

        // If there is a token in the query string, keep compatibility
        // with the old flow. Supabase recovery itself does not normally
        // require this token.
        setRecoveryReady(false);
      } catch {
        if (mounted) {
          setRecoveryReady(false);
        }
      } finally {
        if (mounted) {
          setCheckingRecovery(false);
        }
      }
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryReady(true);
        setCheckingRecovery(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      password: true,
      confirm: true,
    });

    if (!isValid || submitting) return;

    setSubmitting(true);

    try {
      /*
       * Supabase recovery users are authenticated temporarily by the
       * recovery session. The correct operation is updateUser().
       */
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setDone(true);

      toast.success("Password updated. Please log in.");

      // Clear the recovery session after the password has been changed.
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not reset your password.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <Section
        eyebrow="Account recovery"
        title="Set a new | password |"
        subtitle="Choose a strong password you haven't used before."
      >
        <div className="glass rounded-3xl p-6 md:p-8 max-w-md mx-auto">
          {checkingRecovery ? (
            <div
              className="text-center py-8"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-7 w-7 animate-spin mx-auto mb-4" />

              <div className="text-lg font-semibold">
                Checking recovery link…
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                Verifying your password reset request.
              </p>
            </div>
          ) : !recoveryReady && !done ? (
            <div className="text-center">
              <div className="text-lg font-semibold">
                Reset link missing or expired
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                This recovery link is no longer valid. Request a new password
                reset email and open the newest link.
              </p>

              <Link
                to="/forgot-password"
                className="mt-5 inline-block rounded-2xl px-5 py-3 bg-grad-hero text-white font-semibold glow"
              >
                Request new link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-grad-neon grid place-items-center mx-auto mb-4 glow">
                <CheckCircle2 className="h-7 w-7 text-black" />
              </div>

              <div className="text-lg font-semibold">
                Password updated
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                Your password has been changed successfully. You can now sign
                in with your new password.
              </p>
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/login",
                  search: {
                    redirect: "/dashboard",
                  },
                })
              }
              className="mt-5 w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow"
            >
              Go to login
            </button>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="space-y-3"
              noValidate
            >
              <PasswordField
                label="New password"
                value={password}
                onChange={setPassword}
                error={
                  touched.password
                    ? passwordError
                    : undefined
                }
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
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {submitting
                  ? "Updating…"
                  : "Update password"}
              </button>
            </form>
          )}
        </div>
      </Section>
    </PageShell>
  );
}