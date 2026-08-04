import { useState, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import type { SeriesPoint } from "../../types/models";

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "cool",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "cool" | "warm" | "neon" | "hero";
}) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div className={`absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-40 bg-grad-${tone}`} />
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

const TONES: Record<string, string> = {
  green: "bg-emerald/15 text-emerald border-emerald/30",
  red: "bg-pink/15 text-pink border-pink/30",
  amber: "bg-orange/15 text-orange border-orange/30",
  blue: "bg-cyan/15 text-cyan border-cyan/30",
  gray: "bg-white/10 text-muted-foreground border-white/15",
};

export function StatusBadge({ label, tone = "gray" }: { label: string; tone?: keyof typeof TONES }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${TONES[tone]}`}>
      {label}
    </span>
  );
}

export function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-white/10">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4">
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      <div className="h-56">{children}</div>
    </div>
  );
}

const PALETTE = ["#38bdf8", "#22d3ee", "#34d399", "#a78bfa", "#fb923c", "#f472b6"];

export function AreaTrend({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="adminArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip contentStyle={{ background: "rgba(12,16,28,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
        <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#adminArea)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarSeries({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} interval={0} angle={-12} height={44} />
        <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "rgba(12,16,28,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutSeries({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "rgba(12,16,28,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Edit / Delete controls used in every admin data table. */
export function RowActions({
  onEdit,
  onDelete,
  label,
  disabled,
}: {
  onEdit: () => void;
  onDelete: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        aria-label={`Edit ${label}`}
        title="Edit"
        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/10 transition disabled:opacity-50"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit
      </button>
      <button
        type="button"
        onClick={() => {
          if (typeof window === "undefined" || window.confirm(`Delete ${label}? This cannot be undone.`)) onDelete();
        }}
        disabled={disabled}
        aria-label={`Delete ${label}`}
        title="Delete"
        className="inline-flex items-center gap-1 rounded-lg border border-pink/30 bg-pink/10 px-2.5 py-1.5 text-xs font-semibold text-pink hover:bg-pink/20 transition disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    </div>
  );
}

/** Accessible switch used for every editable admin toggle. */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition disabled:opacity-50 ${
        checked ? "bg-grad-cool border-transparent" : "bg-white/10 border-white/15"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

export type EditField = {
  key: string;
  label: string;
  type?: "text" | "number" | "select";
  options?: { value: string; label: string }[];
};

/**
 * Generic edit form for a table row. Field definitions are data-driven so the
 * same panel works for products, categories, inventory, suppliers and users.
 */
export function EditPanel({
  title,
  fields,
  value,
  saving,
  onCancel,
  onSave,
}: {
  title: string;
  fields: EditField[];
  value: Record<string, string | number>;
  saving?: boolean;
  onCancel: () => void;
  onSave: (next: Record<string, string | number>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string | number>>(value);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
      className="glass rounded-2xl p-5 mb-6"
    >
      <div className="font-semibold mb-4">{title}</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="text-xs text-muted-foreground">{f.label}</span>
            {f.type === "select" ? (
              <select
                value={String(draft[f.key] ?? "")}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                value={String(draft[f.key] ?? "")}
                onChange={(e) =>
                  setDraft({ ...draft, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })
                }
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            )}
          </label>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={saving} className="rounded-xl px-5 py-2.5 bg-grad-hero text-white text-sm font-semibold glow disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl px-5 py-2.5 border border-white/10 text-sm font-semibold hover:bg-white/5">
          Cancel
        </button>
      </div>
    </form>
  );
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
