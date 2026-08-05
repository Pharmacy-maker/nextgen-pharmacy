import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockPrescriptions } from "../mock/db";
import type {
  ID,
  Prescription,
  PrescriptionScan,
  PrescriptionStatus,
} from "../../../types/models";

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

  /**
   * Kicks off backend OCR + AI medicine extraction for an uploaded
   * prescription. The backend returns a `PrescriptionScan`; poll
   * `scanStatus` while `status` is "queued" or "processing".
   */
  async scan(prescriptionId: ID): Promise<PrescriptionScan> {
    if (!USE_MOCK_API)
      return apiFetch<PrescriptionScan>(ENDPOINTS.prescriptions.scan(prescriptionId), {
        method: "POST",
      });
    /**
     * No fabricated extraction: OCR and medicine matching can only come from
     * the backend AI service, so the mock branch reports it as unavailable.
     */
    return mockDelay(
      {
        id: `scan-${prescriptionId}`,
        prescriptionId,
        status: "unavailable" as const,
        medicines: [],
        message:
          "Your prescription was uploaded and is queued for pharmacist review. Automatic medicine extraction becomes available once the AI scanning service is connected.",
      },
      1200,
    );
  },

  /** Polls an in-flight scan. */
  async scanStatus(prescriptionId: ID): Promise<PrescriptionScan> {
    if (!USE_MOCK_API)
      return apiFetch<PrescriptionScan>(ENDPOINTS.prescriptions.scanStatus(prescriptionId));
    return prescriptionService.scan(prescriptionId);
  },
};
