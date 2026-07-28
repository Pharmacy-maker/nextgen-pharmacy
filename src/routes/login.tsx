import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === "login" ? "bg-grad-hero text-white" : ""}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === "signup" ? "bg-grad-hero text-white" : ""}`}
            >
              Sign up
            </button>
          </div>
          {mode === "login" ? <LoginForm onDone={(u) => { login(u); navigate({ to: "/" }); }} /> : <SignupForm onDone={(u) => { login(u); navigate({ to: "/" }); }} />}
        </div>
      </Section>
    </PageShell>
  );
}

function LoginForm({ onDone }: { onDone: (u: { name: string; email: string }) => void }) {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginForm>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = loginSchema.safeParse(form);
    if (!r.success) return setErrors(toFieldErrors<LoginForm>(r.error));
    onDone({ name: form.email.split("@")[0], email: form.email });
  };
  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <Field label="Email" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            const r = emailSchema.safeParse(e.target.value);
            setErrors((x) => ({ ...x, email: r.success ? undefined : r.error.issues[0]?.message }));
          }}
          className={inputCls(!!errors.email)}
          placeholder="you@email.com"
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={inputCls(!!errors.password)}
          placeholder="Your password"
        />
      </Field>
      <button type="submit" className="w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow">
        Sign in
      </button>
    </form>
  );
}

function SignupForm({ onDone }: { onDone: (u: { name: string; email: string }) => void }) {
  const [form, setForm] = useState<SignupForm>({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors<SignupForm>>({});
  const update = <K extends keyof SignupForm>(k: K, v: SignupForm[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    const r = signupSchema.safeParse(next);
    if (r.success) setErrors({});
    else {
      const map = toFieldErrors<SignupForm>(r.error);
      setErrors((prev) => ({ ...prev, [k]: map[k] }));
    }
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = signupSchema.safeParse(form);
    if (!r.success) return setErrors(toFieldErrors<SignupForm>(r.error));
    onDone({ name: form.name, email: form.email });
  };
  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <Field label="Full name" error={errors.name}>
        <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls(!!errors.name)} />
      </Field>
      <Field label="Email" error={errors.email}>
        <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls(!!errors.email)} />
      </Field>
      <Field label="Phone" error={errors.phone}>
        <input inputMode="numeric" value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className={inputCls(!!errors.phone)} />
      </Field>
      <Field label="Password" error={errors.password}>
        <input
          type="password"
          value={form.password}
          onChange={(e) => {
            update("password", e.target.value);
            const r = passwordSchema.safeParse(e.target.value);
            setErrors((x) => ({ ...x, password: r.success ? undefined : r.error.issues[0]?.message }));
          }}
          className={inputCls(!!errors.password)}
        />
        <div className="text-[10px] text-muted-foreground mt-1">
          Min 8 chars, incl. uppercase, lowercase, number & special.
        </div>
      </Field>
      <Field label="Confirm password" error={errors.confirm}>
        <input type="password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} className={inputCls(!!errors.confirm)} />
      </Field>
      <button type="submit" className="w-full py-3 rounded-2xl bg-grad-hero text-white font-semibold glow">
        Create account
      </button>
    </form>
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
