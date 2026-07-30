import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockPrescriptions } from "../mock/db";
import type { ID, Prescription, PrescriptionStatus } from "../../../types/models";

let prescriptions: Prescription[] = [...mockPrescriptions];

export const prescriptionService = {
  async list(): Promise<Prescription[]> {
    if (!USE_MOCK_API) return apiFetch<Prescription[]>(ENDPOINTS.prescriptions.list);
    return mockDelay(prescriptions);
  },

  async listMine(userId: ID): Promise<Prescription[]> {
    if (!USE_MOCK_API) return apiFetch<Prescription[]>(ENDPOINTS.prescriptions.mine);
    return mockDelay(prescriptions.filter((p) => p.userId === userId));
  },

  async upload(file: File, userId: ID): Promise<Prescription> {
    if (!USE_MOCK_API) {
      const body = new FormData();
      body.append("file", file);
      body.append("userId", userId);
      return apiFetch<Prescription>(ENDPOINTS.prescriptions.upload, { method: "POST", body });
    }
    const rx: Prescription = {
      id: `rx-${Date.now()}`,
      userId,
      customerName: "You",
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      status: "pending",
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    prescriptions = [rx, ...prescriptions];
    return mockDelay(rx, 900);
  },

  async review(id: ID, status: PrescriptionStatus, note?: string): Promise<Prescription> {
    if (!USE_MOCK_API)
      return apiFetch<Prescription>(ENDPOINTS.prescriptions.review(id), { method: "PATCH", body: { status, note } });
    prescriptions = prescriptions.map((p) =>
      p.id === id ? { ...p, status, note, reviewedBy: "Admin" } : p,
    );
    return mockDelay(prescriptions.find((p) => p.id === id)!, 300);
  },
};
