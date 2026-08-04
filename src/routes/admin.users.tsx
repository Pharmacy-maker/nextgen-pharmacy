import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { AdminPageHeader, DataTable, EditPanel, RowActions, StatusBadge } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { userService } from "../lib/api";
import type { User, UserStatus } from "../types/models";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["admin", "users"], queryFn: () => userService.list() });
  const [editing, setEditing] = useState<User | null>(null);
  const edit = useMutation({
    mutationFn: (input: { id: string; patch: Partial<User> }) => userService.update(input.id, input.patch),
    onSuccess: () => { toast.success("User updated"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => userService.updateStatus(id, status),
    onSuccess: () => { toast.success("User status updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader title="User management" subtitle="Customer list, contact details, account status and roles." />
      {editing && (
        <EditPanel
          title={`Edit user • ${editing.name}`}
          saving={edit.isPending}
          value={{ name: editing.name, email: editing.email, phone: editing.phone ?? "", role: editing.role, status: editing.status }}
          fields={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "role", label: "Role", type: "select", options: [
              { value: "user", label: "User" },
              { value: "admin", label: "Admin" },
            ] },
            { key: "status", label: "Status", type: "select", options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "blocked", label: "Blocked" },
            ] },
          ]}
          onCancel={() => setEditing(null)}
          onSave={(next) => edit.mutate({ id: editing.id, patch: next as unknown as Partial<User> })}
        />
      )}
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
                  <div className="mt-2">
                    <RowActions
                      label={u.name}
                      disabled={remove.isPending}
                      onEdit={() => setEditing(u)}
                      onDelete={() => remove.mutate(u.id)}
                    />
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
