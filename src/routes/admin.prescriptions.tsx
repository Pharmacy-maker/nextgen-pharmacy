import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, DataTable, StatusBadge } from "../components/admin/AdminUI";
import { AsyncBoundary } from "../components/site/AsyncState";
import { prescriptionService } from "../lib/api";
import type { PrescriptionStatus } from "../types/models";

export const Route = createFileRoute("/admin/prescriptions")({ component: AdminPrescriptions });

function AdminPrescriptions() {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["admin", "prescriptions"], queryFn: () => prescriptionService.list() });
  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PrescriptionStatus }) => prescriptionService.review(id, status),
    onSuccess: (_d, v) => { toast.success(`Prescription ${v.status}`); qc.invalidateQueries({ queryKey: ["admin", "prescriptions"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader title="Prescription management" subtitle="Review uploaded prescriptions and approve or reject them." />
      <AsyncBoundary isLoading={isLoading} error={error} data={data} onRetry={() => refetch()}>
        {(list) => (
          <DataTable headers={["Customer", "File", "Size", "Uploaded", "Extracted", "Status", "Review"]}>
            {list.map((rx) => (
              <tr key={rx.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{rx.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground">{rx.fileName}</td>
                <td className="px-4 py-3 tabular-nums">{(rx.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                <td className="px-4 py-3 text-muted-foreground">{rx.uploadedAt}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {rx.extractedMedicines?.length ? rx.extractedMedicines.map((m) => `${m.name} (${m.dosage})`).join(", ") : "—"}
                </td>
                <td className="px-4 py-3"><StatusBadge label={rx.status} tone={rx.status === "approved" ? "green" : rx.status === "rejected" ? "red" : "amber"} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => review.mutate({ id: rx.id, status: "approved" })} aria-label="Approve" className="p-2 rounded-lg glass hover:bg-white/15"><Check className="h-4 w-4 text-emerald" /></button>
                    <button onClick={() => review.mutate({ id: rx.id, status: "rejected" })} aria-label="Reject" className="p-2 rounded-lg glass hover:bg-white/15"><X className="h-4 w-4 text-pink" /></button>
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
