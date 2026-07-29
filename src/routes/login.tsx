import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageShell, Section } from "../components/site/Section";
import {
  emailSchema,
  loginSchema,
  passwordSchema,
  signupSchema,
  toFieldErrors,
  type FieldErrors,
} from "../lib/validation";
import { useAuth } from "../lib/store";
import {
  ConfirmPasswordField,
  PasswordField,
  TextField,
} from "../components/site/FormFields";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login — Rays Pharmacy" },
      { name: "description", content: "Sign in or create your Rays Pharmacy account to track orders and save prescriptions." },
      { property: "og:title", content: "Login — Rays Pharmacy" },
      { property: "og:description", content: "Sign in to your Rays Pharmacy account." },
    ],
  }),
});

type LoginForm = { email: string; password: string };
type SignupForm = { name: string; email: string; phone: string; password: string; confirm: string };

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <PageShell>
        <Section eyebrow="Account" title={`Hi, | ${user.name} |`}>
          <div className="glass rounded-3xl p-8 max-w-md mx-auto text-center">
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link to="/cart" className="rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow">
                View cart
              </Link>
              <Link to="/delivery" className="rounded-xl px-5 py-2.5 glass hover:bg-white/15">
                Track orders
              </Link>
              <button onClick={logout} className="rounded-xl px-5 py-2.5 glass hover:bg-white/15">
                Sign out
              </button>
            </div>
          </div>
        </Section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Section eyebrow="Welcome" title={mode === "login" ? "Sign | In |" : "Create | Account |"}>
        <div className="glass rounded-3xl p-6 md:p-8 max-w-md mx-auto">
          <div role="tablist" className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "login" ? "bg-grad-hero text-white" : ""}`}
            >
              Login
            </button>
            <button
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "signup" ? "bg-grad-hero text-white" : ""}`}
            >
              Sign up
            </button>
          </div>
          {mode === "login" ? (
            <LoginFormEl onDone={(u) => { login(u); navigate({ to: "/" }); }} />
          ) : (
            <SignupFormEl onDone={(u) => { login(u); navigate({ to: "/" }); }} />
          )}
        </div>
      </Section>
    </PageShell>
  );
}

function LoginFormEl({ onDone }: { onDone: (u: { name: string; email: string }) => void }) {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<keyof LoginForm, boolean>>({ email: false, password: false });
  const [errors, setErrors] = useState<FieldErrors<LoginForm>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (next: LoginForm) => {
    const r = loginSchema.safeParse(next);
    if (r.success) {
      setErrors({});
      return true;
    }
    setErrors(toFieldErrors<LoginForm>(r.error));
    return false;
  };

  const setField = <K extends keyof LoginForm>(k: K, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    validate(next);
  };

  const isValid = useMemo(() => loginSchema.safeParse(form).success, [form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validate(form) || submitting) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      toast.success("Signed in successfully");
      onDone({ name: form.email.split("@")[0], email: form.email });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={form.email}
        onChange={(v) => setField("email", v)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={errors.email}
        touched={touched.email}
      />
      <PasswordField
        label="Password"
        value={form.password}
        onChange={(v) => setField("password", v)}
        error={errors.password}
        touched={touched.password}
        showMeter={false}
        showChecklist={false}
        autoComplete="current-password"
        placeholder="Your password"
      />
      <button
        type="submit"
        disabled={!isValid || submitting}
        className="w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function SignupFormEl({ onDone }: { onDone: (u: { name: string; email: string }) => void }) {
  const [form, setForm] = useState<SignupForm>({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [touched, setTouched] = useState<Record<keyof SignupForm, boolean>>({
    name: false, email: false, phone: false, password: false, confirm: false,
  });
  const [errors, setErrors] = useState<FieldErrors<SignupForm>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (next: SignupForm) => {
    const r = signupSchema.safeParse(next);
    if (r.success) {
      setErrors({});
      return true;
    }
    setErrors(toFieldErrors<SignupForm>(r.error));
    return false;
  };

  const setField = <K extends keyof SignupForm>(k: K, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    validate(next);
  };

  const isValid = useMemo(() => signupSchema.safeParse(form).success, [form]);
  const passwordDetail = useMemo(() => {
    const r = passwordSchema.safeParse(form.password);
    return r.success ? undefined : r.error.issues[0]?.message;
  }, [form.password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, password: true, confirm: true });
    if (!validate(form) || submitting) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      toast.success("Account created — welcome to Rays Pharmacy!");
      onDone({ name: form.name, email: form.email });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
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
      <PasswordField
        label="Password"
        value={form.password}
        onChange={(v) => setField("password", v)}
        error={touched.password ? passwordDetail : undefined}
        touched={touched.password}
        autoComplete="new-password"
      />
      <ConfirmPasswordField
        value={form.confirm}
        onChange={(v) => setField("confirm", v)}
        original={form.password}
        touched={touched.confirm}
      />
      <button
        type="submit"
        disabled={!isValid || submitting}
        className="w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
