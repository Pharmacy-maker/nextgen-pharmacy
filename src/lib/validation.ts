import { z } from "zod";

export const nameSchema = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(60, "Name is too long")
  .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, "Name may contain letters only");

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address").max(255);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Phone must be exactly 10 digits");

export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/\d/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

export const addressSchema = z.string().trim().min(5, "Address is required").max(200);
export const pincodeSchema = z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits");
export const citySchema = z.string().trim().min(2, "City is required").max(60);

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

export const checkoutSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  address: addressSchema,
  city: citySchema,
  pincode: pincodeSchema,
});

export const PRESCRIPTION_MAX_BYTES = 5 * 1024 * 1024;
export const PRESCRIPTION_MIME = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

export function validatePrescription(file: File): string | null {
  if (!PRESCRIPTION_MIME.includes(file.type))
    return "Only JPG, JPEG, PNG or PDF files are accepted";
  if (file.size > PRESCRIPTION_MAX_BYTES) return "File must be 5 MB or smaller";
  return null;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function toFieldErrors<T>(err: z.ZodError): FieldErrors<T> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out as FieldErrors<T>;
}
