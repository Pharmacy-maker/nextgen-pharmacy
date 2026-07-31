import { useId, useMemo, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";

type Status = "idle" | "valid" | "invalid";

function borderCls(status: Status) {
  if (status === "invalid") return "border-pink/70 focus:ring-pink/40";
  if (status === "valid") return "border-emerald/60 focus:ring-emerald/40";
  return "border-white/10 focus:ring-primary/60";
}

function baseInputCls(status: Status) {
  return `w-full bg-white/5 rounded-xl px-3 py-2.5 border transition-colors focus:outline-none focus:ring-2 ${borderCls(status)}`;
}

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="block">
      <label htmlFor={htmlFor} className="block text-xs text-muted-foreground mb-1">
        {label}
      </label>
      {children}
      {error ? (
        <span role="alert" className="block text-xs text-pink mt-1">
          {error}
        </span>
      ) : hint ? (
        <span className="block text-xs text-muted-foreground/80 mt-1">{hint}</span>
      ) : null}
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  touched?: boolean;
  showValid?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  touched,
  showValid = true,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const id = rest.id ?? autoId;
  const status: Status = !touched && !value ? "idle" : error ? "invalid" : showValid ? "valid" : "idle";
  return (
    <Field label={label} error={touched ? error : undefined} hint={hint} htmlFor={id}>
      <input
        {...rest}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={status === "invalid"}
        aria-describedby={error && touched ? `${id}-err` : undefined}
        className={baseInputCls(status)}
      />
    </Field>
  );
}

export type PasswordChecks = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
};

export function scorePassword(pw: string): { checks: PasswordChecks; score: number } {
  const checks: PasswordChecks = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"];
const strengthColors = [
  "bg-white/10",
  "bg-pink/70",
  "bg-orange/70",
  "bg-yellow-400/80",
  "bg-emerald/70",
  "bg-emerald",
];

export function PasswordField({
  label,
  value,
  onChange,
  error,
  touched,
  showMeter = true,
  showChecklist = true,
  autoComplete = "current-password",
  placeholder,
  id: idProp,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  touched?: boolean;
  showMeter?: boolean;
  showChecklist?: boolean;
  autoComplete?: string;
  placeholder?: string;
  id?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [show, setShow] = useState(false);
  const { checks, score } = useMemo(() => scorePassword(value), [value]);
  const status: Status = !touched && !value ? "idle" : error ? "invalid" : "valid";

  return (
    <Field label={label} error={touched ? error : undefined} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={status === "invalid"}
          className={baseInputCls(status) + " pr-11"}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-r-xl"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {showMeter && value.length > 0 && (
        <div className="mt-2" aria-live="polite">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < score ? strengthColors[score] : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            Strength: <span className="font-semibold text-foreground">{strengthLabels[score]}</span>
          </div>
        </div>
      )}
      {showChecklist && (
        <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <Rule ok={checks.length} label="At least 8 characters" />
          <Rule ok={checks.upper} label="One uppercase letter" />
          <Rule ok={checks.lower} label="One lowercase letter" />
          <Rule ok={checks.number} label="One number" />
          <Rule ok={checks.special} label="One special character" />
        </ul>
      )}
    </Field>
  );
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 ${ok ? "text-emerald" : "text-muted-foreground"}`}>
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-60" />}
      <span>{label}</span>
    </li>
  );
}

export function ConfirmPasswordField({
  label = "Confirm password",
  value,
  onChange,
  original,
  touched,
  id: idProp,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  original: string;
  touched?: boolean;
  id?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [show, setShow] = useState(false);
  const matches = value.length > 0 && value === original;
  const hasValue = value.length > 0;
  // Live feedback: as soon as anything is typed we say whether it matches.
  const error = hasValue && !matches ? "Passwords do not match" : undefined;
  const status: Status = !hasValue ? "idle" : matches ? "valid" : "invalid";

  return (
    <Field label={label} error={error} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          aria-invalid={status === "invalid"}
          className={baseInputCls(status) + " pr-11"}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-r-xl"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hasValue && matches && (
        <div className="mt-1 text-[11px] text-emerald flex items-center gap-1">
          <Check className="h-3 w-3" /> Passwords match
        </div>
      )}
    </Field>
  );
}
