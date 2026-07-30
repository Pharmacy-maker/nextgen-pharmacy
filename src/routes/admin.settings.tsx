import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, DataTable, StatusBadge } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { settingsService } from "../lib/api";
import { useAuth } from "../lib/store";
import type { SiteSettings } from "../types/models";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const site = useQuery({ queryKey: ["admin", "settings", "site"], queryFn: () => settingsService.getSite() });
  const roles = useQuery({ queryKey: ["admin", "settings", "roles"], queryFn: () => settingsService.roles() });
  const notifications = useQuery({ queryKey: ["admin", "settings", "notifications"], queryFn: () => settingsService.notifications() });

  const [form, setForm] = useState<SiteSettings | null>(null);
  useEffect(() => { if (site.data) setForm(site.data); }, [site.data]);

  const save = useMutation({
    mutationFn: (input: SiteSettings) => settingsService.updateSite(input),
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["admin", "settings", "site"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Website settings, admin profile, roles & permissions and notifications." />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Website settings</h2>
          <AsyncBoundary isLoading={site.isLoading} error={site.error} data={form ?? undefined} onRetry={() => site.refetch()}>
            {(s) => (
              <form
                className="space-y-3"
                onSubmit={(e) => { e.preventDefault(); save.mutate(s); }}
              >
                <Field label="Site name" value={s.siteName} onChange={(v) => setForm({ ...s, siteName: v })} />
                <Field label="Support email" value={s.supportEmail} onChange={(v) => setForm({ ...s, supportEmail: v })} />
                <Field label="Support phone" value={s.supportPhone} onChange={(v) => setForm({ ...s, supportPhone: v })} />
                <Field label="Delivery fee (₹)" type="number" value={String(s.deliveryFee)} onChange={(v) => setForm({ ...s, deliveryFee: Number(v) })} />
                <Field label="Free delivery above (₹)" type="number" value={String(s.freeDeliveryAbove)} onChange={(v) => setForm({ ...s, freeDeliveryAbove: Number(v) })} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={s.maintenanceMode} onChange={(e) => setForm({ ...s, maintenanceMode: e.target.checked })} />
                  Maintenance mode
                </label>
                <button type="submit" disabled={save.isPending} className="rounded-xl px-5 py-2.5 bg-grad-hero text-white text-sm font-semibold disabled:opacity-60">
                  {save.isPending ? "Saving…" : "Save settings"}
                </button>
              </form>
            )}
          </AsyncBoundary>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Admin profile</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{user?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{user?.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Role</dt><dd><StatusBadge label="admin" tone="blue" /></dd></div>
          </dl>

          <h2 className="font-semibold mt-6 mb-3">Notifications</h2>
          <AsyncBoundary isLoading={notifications.isLoading} error={notifications.error} data={notifications.data} onRetry={() => notifications.refetch()}>
            {(list) => (
              <ul className="space-y-3">
                {list.map((n) => (
                  <li key={n.id} className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">{n.label}</div>
                      <div className="text-xs text-muted-foreground">{n.description}</div>
                    </div>
                    <StatusBadge label={n.enabled ? "on" : "off"} tone={n.enabled ? "green" : "gray"} />
                  </li>
                ))}
              </ul>
            )}
          </AsyncBoundary>
        </div>
      </div>

      <h2 className="font-semibold mt-8 mb-3">Roles & permissions</h2>
      <AsyncBoundary isLoading={roles.isLoading} error={roles.error} data={roles.data} onRetry={() => roles.refetch()}>
        {(list) => (
          <DataTable headers={["Role", "Permissions"]}>
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{r.role}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {r.permissions.map((p) => <StatusBadge key={p} label={p} tone="blue" />)}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncBoundary>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60" />
    </label>
  );
}
