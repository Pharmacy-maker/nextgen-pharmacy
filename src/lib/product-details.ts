import type { Product } from "../types/models";

/**
 * Product detail presentation layer.
 *
 * The catalogue (mock today, database later) may only carry the core columns.
 * This helper returns a fully populated detail object: every field prefers the
 * value coming from the data source and only falls back to a deterministic
 * placeholder when the backend has not supplied it yet. When real columns land,
 * nothing in the UI needs to change.
 */

export type ProductDetails = {
  form: string;
  packSize: string;
  description: string;
  composition: string[];
  dosage: string;
  usage: string;
  warnings: string[];
  sideEffects: string[];
  storage: string;
  prescriptionRequired: boolean;
};

const FORMS = ["Tablet", "Capsule", "Syrup", "Sachet", "Topical gel", "Soft gel"];
const PACKS = ["Strip of 10 units", "Bottle of 60 ml", "Box of 15 units", "Jar of 30 units"];

const RX_CATEGORIES = ["cardiac", "diabetes", "kidney", "pain relief", "cancer care"];

function seedOf(value: string): number {
  return Array.from(value).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function getProductDetails(p: Product): ProductDetails {
  const seed = seedOf(p.id + p.name);
  const form = p.form ?? FORMS[seed % FORMS.length];
  const packSize = p.packSize ?? PACKS[seed % PACKS.length];
  const rx = p.prescriptionRequired ?? RX_CATEGORIES.includes(p.category.toLowerCase());

  return {
    form,
    packSize,
    prescriptionRequired: rx,
    description:
      p.description ??
      `${p.name} is a ${form.toLowerCase()} from ${p.manufacturer} used in ${p.category.toLowerCase()} care. ` +
        `Each pack (${packSize.toLowerCase()}) is quality-checked, sealed and stored under pharmacy-grade conditions before dispatch.`,
    composition:
      p.composition ?? [
        `${p.name.replace(/\s+\d+.*$/, "")} — active ingredient`,
        "Microcrystalline cellulose (excipient)",
        "Magnesium stearate (excipient)",
      ],
    dosage:
      p.dosage ??
      `Adults: 1 ${form.toLowerCase()} once or twice daily, or exactly as prescribed by your physician. Do not exceed the prescribed dose.`,
    usage:
      p.usage ??
      "Take with a glass of water, preferably after food, at the same time each day. Complete the full course even if you feel better.",
    warnings:
      p.warnings ?? [
        "Not recommended during pregnancy or breastfeeding without medical advice.",
        "Inform your doctor about any ongoing medication or known allergies.",
        "Keep out of reach of children.",
      ],
    sideEffects:
      p.sideEffects ?? ["Mild nausea", "Headache", "Dizziness", "Stomach discomfort"],
    storage:
      p.storage ??
      "Store below 30°C in a cool, dry place away from direct sunlight. Keep in the original pack until use.",
  };
}

export function stockStatus(stock: number): { label: string; tone: "green" | "amber" | "red" } {
  if (stock <= 0) return { label: "Out of stock", tone: "red" };
  if (stock <= 60) return { label: "Low stock", tone: "amber" };
  return { label: "In stock", tone: "green" };
}
