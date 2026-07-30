import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader, DataTable, StatusBadge } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { userService } from "../lib/api";
import type { UserStatus } from "../types/models";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["admin", "users"], queryFn: () => userService.list() });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => userService.updateStatus(id, status),
    onSuccess: () => { toast.success("User status updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader title="User management" subtitle="Customer list, contact details, account status and roles." />
      <AsyncBoundary isLoading={isLoading} error={error} data={data} onRetry={() => refetch()}>
        {(list) => (
          <DataTable headers={["Name", "Email", "Phone", "Role", "Joined", "Status", "Actions"]}>
            {list.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                <td className="px-4 py-3"><StatusBadge label={u.role} tone={u.role === "admin" ? "blue" : "gray"} /></td>
                <td className="px-4 py-3 text-muted-foreground">{u.createdAt}</td>
                <td className="px-4 py-3"><StatusBadge label={u.status} tone={u.status === "active" ? "green" : u.status === "blocked" ? "red" : "amber"} /></td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Change status for ${u.name}`}
                    value={u.status}
                    onChange={(e) => update.mutate({ id: u.id, status: e.target.value as UserStatus })}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncBoundary>
    </div>
  );
}
