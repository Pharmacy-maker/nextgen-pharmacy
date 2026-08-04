import type { PaymentMethod } from "../types/models";

/**
 * Payment UI configuration.
 *
 * Only the two methods the pharmacy supports are exposed. The UPI apps list is
 * data-driven so the backend can later return the enabled handles/providers
 * without any UI change.
 */

export const SUPPORTED_PAYMENT_METHODS = ["upi", "cod"] as const;
export type SupportedPaymentMethod = (typeof SUPPORTED_PAYMENT_METHODS)[number];

export const UPI_APPS = [
  { id: "phonepe", label: "PhonePe", accent: "var(--purple)" },
  { id: "gpay", label: "Google Pay", accent: "var(--cyan)" },
  { id: "bhim", label: "BHIM UPI", accent: "var(--emerald)" },
  { id: "supermoney", label: "SuperMoney", accent: "var(--orange)" },
] as const;

export type UpiAppId = (typeof UPI_APPS)[number]["id"];

export const UPI_APP_IDS = UPI_APPS.map((a) => a.id) as unknown as readonly UpiAppId[];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
  cod: "Cash on Delivery",
};

export function upiAppLabel(id?: string): string | undefined {
  return UPI_APPS.find((a) => a.id === id)?.label;
}
