import { apiFetch, mockDelay } from "../client";
import { supabase } from "../../supabase";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockPrescriptions } from "../mock/db";
import type {
  ID,
  Prescription,
  PrescriptionScan,
  PrescriptionStatus,
} from "../../../types/models";

let prescriptions: Prescription[] = [...mockPrescriptions];


async function findMatchingProducts(
  medicineNames: string[]
) {
  const matches = [];

  for (const medicine of medicineNames) {
    const cleanName = medicine
      .replace(/^SYP\s+/i, "")
      .replace(/\(.*?\)/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim();

    console.log(
      "Searching product for:",
      medicine,
      "=>",
      cleanName
    );

    console.log(
  "PRESCRIPTION SUPABASE URL:",
  import.meta.env.VITE_SUPABASE_URL
);

    const searchWords = cleanName
      .split(" ")
      .filter(Boolean);

    let foundProduct = null;

    for (const word of searchWords) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${word}%`)
        .limit(1);
        console.log(
  "MATCH QUERY RESULT:",
  data?.[0]
);
console.log(
  "PRESCRIPTION TABLE COUNT:",
  data?.length
);

console.log(
  "PRESCRIPTION QUERY ROW:",
  data?.[0]
);
      console.log(
        "MATCH SOURCE ID:",
        data?.[0]?.id
      );  

      console.log(
        `Search word "${word}" result:`,
        data
      );

      if (!error && data?.length) {
        foundProduct = data[0];
        break;
      }
    }

    if (foundProduct) {
      console.log("FOUND PRODUCT ID:", foundProduct.id);
      console.log(
  "ADDING TO MATCHES:",
  foundProduct.id,
  foundProduct.name
);

matches.push({
  id: String(foundProduct.id),
  name: foundProduct.name,
  category: foundProduct.category,
  supplier: foundProduct.supplier,
  manufacturer: foundProduct.manufacturer,
  mfg: foundProduct.mfg ?? "",
  exp: foundProduct.exp ?? "",
  stock: Number(foundProduct.stock ?? 0),
  rating: Number(foundProduct.rating ?? 0),
  reviews: Number(foundProduct.reviews ?? 0),
  price: Number(foundProduct.price ?? 0),
  discount: Number(foundProduct.discount ?? 0),
  grad: foundProduct.grad ?? "var(--grad-cool)",
  image:
    foundProduct.image ||
    "/images/medicine-placeholder.png",
  description: foundProduct.description ?? "",
  form: foundProduct.form,
  packSize:
    foundProduct.pack_size ??
    foundProduct.packSize,
  composition: Array.isArray(foundProduct.composition)
    ? foundProduct.composition
    : [],
  dosage: foundProduct.dosage,
  usage: foundProduct.usage,
  warnings: Array.isArray(foundProduct.warnings)
    ? foundProduct.warnings
    : [],
  sideEffects: Array.isArray(foundProduct.side_effects)
    ? foundProduct.side_effects
    : [],
  storage: foundProduct.storage,
  prescriptionRequired:
    foundProduct.prescription_required ?? false,
  tags: Array.isArray(foundProduct.tags)
    ? foundProduct.tags
    : [],
});

      console.log(
        "Matched:",
        medicine,
        "->",
        foundProduct.name
      );
    } else {
      console.log(
        "No product found for:",
        medicine
      );
    }
  }

  return matches;
}

export const prescriptionService = {
  async list(): Promise<Prescription[]> {
    if (!USE_MOCK_API) {
      return apiFetch<Prescription[]>(
        ENDPOINTS.prescriptions.list
      );
    }

    return mockDelay(prescriptions);
  },

  async listMine(
    userId: ID
  ): Promise<Prescription[]> {
    if (!USE_MOCK_API) {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", {
          ascending: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        customerName: row.customer_name,
        fileName: row.file_name,
        fileType: row.file_type,
        fileSize: row.file_size,
        status: row.status,
        note: row.note,
        reviewedBy: row.reviewed_by,
        uploadedAt: row.uploaded_at,
      }));
    }

    return mockDelay(
      prescriptions.filter(
        (p) => p.userId === userId
      )
    );
  },

  async upload(
    file: File,
    userId: ID
  ): Promise<Prescription> {
    if (!USE_MOCK_API) {
      const filePath =
        `${userId}/${Date.now()}-${file.name}`;

      const uploadResult =
        await supabase.storage
          .from("prescriptions")
          .upload(filePath, file);

      if (uploadResult.error) {
        throw new Error(
          uploadResult.error.message
        );
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("prescriptions")
          .getPublicUrl(filePath);

      const { data, error } =
        await supabase
          .from("prescriptions")
          .insert({
            user_id: userId,
            customer_name: "You",
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url:
              publicUrlData.publicUrl,
            status: "pending",
          })
          .select()
          .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        userId: data.user_id,
        customerName:
          data.customer_name,
        fileName: data.file_name,
        fileType: data.file_type,
        fileSize: data.file_size,
        status: data.status,
        uploadedAt: data.uploaded_at,
      };
    }

    const rx: Prescription = {
      id: `rx-${Date.now()}`,
      userId,
      customerName: "You",
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      status: "pending",
      uploadedAt:
        new Date().toISOString(),
    };

    prescriptions = [rx, ...prescriptions];

    return mockDelay(rx, 900);
  },

  async review(
    id: ID,
    status: PrescriptionStatus,
    note?: string
  ): Promise<Prescription> {
    if (!USE_MOCK_API) {
      return apiFetch<Prescription>(
        ENDPOINTS.prescriptions.review(id),
        {
          method: "PATCH",
          body: { status, note },
        }
      );
    }

    prescriptions = prescriptions.map(
      (p) =>
        p.id === id
          ? {
              ...p,
              status,
              note,
              reviewedBy: "Admin",
            }
          : p
    );

    return mockDelay(
      prescriptions.find(
        (p) => p.id === id
      )!,
      300
    );
  },

  async scan(
    prescriptionId: ID
  ): Promise<PrescriptionScan> {
    const {
      data: prescription,
      error,
    } = await supabase
      .from("prescriptions")
      .select("file_url")
      .eq("id", prescriptionId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const {
      data,
      error: functionError,
    } = await supabase.functions.invoke(
      "scan-prescription",
      {
        body: {
          imageUrl:
            prescription.file_url,
        },
      }
    );

    if (functionError) {
      throw functionError;
    }

    console.log("Gemini result:", data);
    console.log("Medicines:", data.medicines);

    const medicines = data?.medicines ?? [];

    const matchedProducts =
      await findMatchingProducts(
        medicines.map(
          (m: any) => m.name
        )
      );

    console.log(
      "================================="
    );
    console.log(
      "EXTRACTED MEDICINES:",
      medicines
    );
    console.log(
      "MATCHED PRODUCTS:",
      matchedProducts
    );
    console.log(
      "================================="
   );


    // Save extracted medicines
    if (medicines.length > 0) {
      const rows = medicines.map(
        (medicine: any) => ({
          prescription_id: prescriptionId,
          medicine_name: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration: medicine.duration,
        })
      );

      const { error: saveError } =
        await supabase
          .from("prescription_medicines")
          .insert(rows);

      if (saveError) {
        console.error(
          "Failed to save medicines:",
          saveError
        );
      }
    }

    return {
      id: `scan-${prescriptionId}`,
      prescriptionId,
      status: "completed",
      medicines,
      matchedProducts,
      message:
        "Prescription scanned successfully",
    };
  },

  async scanStatus(
    prescriptionId: ID
  ): Promise<PrescriptionScan> {
    if (!USE_MOCK_API) {
      return apiFetch<PrescriptionScan>(
        ENDPOINTS.prescriptions.scanStatus(
          prescriptionId
        )
      );
    }

    return prescriptionService.scan(
      prescriptionId
    );
  },
};