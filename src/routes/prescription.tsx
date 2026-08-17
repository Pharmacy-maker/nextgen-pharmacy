import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AlertTriangle, Brain, CheckCircle2, Loader2, Sparkles, Upload, X } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import {
  PRESCRIPTION_MAX_BYTES,
  PRESCRIPTION_MIME,
  validatePrescription,
} from "../lib/validation";
import { useAuth, useCart } from "../lib/store";
import { prescriptionService } from "../lib/api";
import type { PrescriptionScan } from "../types/models";
import { toast } from "sonner";

export const Route = createFileRoute("/prescription")({
  component: PrescriptionPage,
  head: () => ({
    meta: [
      { title: "Upload Prescription — Rays Pharmacy" },
      { name: "description", content: "Upload your prescription and let Rays AI extract medicines instantly." },
      { property: "og:title", content: "Upload Prescription — Rays Pharmacy" },
      { property: "og:description", content: "AI-powered prescription scanning with instant medicine matching." },
    ],
  }),
});

type Phase = "idle" | "uploading" | "scanning" | "done" | "error";

function PrescriptionPage() {
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<PrescriptionScan | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cart = useCart();
  console.log("PRESCRIPTION CART:", cart);
  const { add } = cart;
  console.log("ADD FUNCTION REF:", add);
  const { user } = useAuth();

  const busy = phase === "uploading" || phase === "scanning";

  const acceptFile = async (f: File | null) => {
    setError(null);
    setScan(null);
    if (!f) return;
    const err = validatePrescription(f);
    if (err) {
      setError(err);
      setPhase("error");
      return;
    }
    setFile(f);
    setPhase("uploading");
    try {
      console.log("AUTH USER:", user);
      console.log("USER ID:", user?.id);
      const rx = await prescriptionService.upload(f, user?.id ?? "guest");
      setPhase("scanning");
      const result = await prescriptionService.scan(rx.id);
      setScan(result);
      setPhase(result.status === "failed" ? "error" : "done");
      if (result.status === "failed") setError(result.message ?? "Scan failed. Please try again.");
      else toast.success("Prescription uploaded");
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    }
  };

  const extracted = scan?.medicines ?? [];
  const matchedProducts = scan?.matchedProducts ?? [];

  console.log("SCAN RESULT:", scan);
  console.log("MATCHED PRODUCTS:", matchedProducts);
  console.log("EXTRACTED:", extracted);

  const addAll = () => {
  alert("BUTTON CLICKED");

  console.log("MATCHED PRODUCTS COUNT:", matchedProducts.length);
  console.log("MATCHED PRODUCTS:", matchedProducts);

  matchedProducts.forEach((p, index) => {
    console.log("ITEM", index, p);

    console.log("CALLING ADD FOR:", p.id);
    add(p.id, 1);
  });

  alert("FINISHED LOOP");
};
  return (
    <PageShell>
      <Section eyebrow="AI Vision" title="Upload Your | Prescription |" subtitle="Drop a photo — our AI extracts medicines, dosages, and finds the best price in seconds.">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              acceptFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className={`relative rounded-3xl p-10 border-2 border-dashed transition-all ${drag ? "border-primary bg-primary/10" : "border-white/15 glass"}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={PRESCRIPTION_MIME.join(",")}
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
            />
            <div className="text-center flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-grad-hero grid place-items-center glow">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                {busy && <div className="absolute inset-0 rounded-2xl border-2 border-neon animate-pulse-glow" />}
              </div>
              <div>
                <div className="font-semibold text-lg">Drop prescription here</div>
                <div className="text-muted-foreground text-sm">
                  or click to browse • JPG, JPEG, PNG or PDF • up to {Math.round(PRESCRIPTION_MAX_BYTES / 1024 / 1024)}MB
                </div>
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" /> {file ? "Choose different file" : "Choose file"}
              </button>
              {file && (
                <div className="w-full flex items-center justify-between gap-3 glass rounded-xl px-3 py-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => {
                      setFile(null);
                      setScan(null);
                      setError(null);
                      setPhase("idle");
                    }}
                    className="h-6 w-6 grid place-items-center rounded-md hover:bg-white/10"
                    aria-label="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {error && (
                <div className="w-full text-sm text-pink text-left flex items-start gap-2" role="alert">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
                </div>
              )}
              {busy && (
                <div className="w-full mt-2 flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                  <Loader2 className="h-4 w-4 animate-spin text-neon" />
                  {phase === "uploading" ? "Uploading prescription…" : "AI scanning…"}
                </div>
              )}
              {phase === "done" && (
                <div className="w-full mt-2 flex items-center gap-2 text-sm text-emerald" aria-live="polite">
                  <CheckCircle2 className="h-4 w-4" /> Prescription uploaded successfully
                </div>
              )}
            </div>
          </div>
          <div className="rounded-3xl glass p-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple/40 blur-3xl" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Brain className="h-4 w-4 text-neon" /> AI extraction preview
            </div>
            {extracted.map((m, i) => (
              <div key={`${m.name}-${i}`} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[m.dosage, m.quantity ? `Qty ${m.quantity}` : null, m.instructions]
                      .filter(Boolean)
                      .join(" • ") || "As prescribed"}
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald" />
              </div>
            ))}
            {extracted.length === 0 && (
              <div className="text-sm text-muted-foreground py-6">
                {scan?.message ??
                  (busy
                    ? "Reading your prescription…"
                    : "Upload a prescription to see extracted medicines, dosages, and quantities here.")}
              </div>
            )}
            <button
              disabled={extracted.length === 0}
              onClick={addAll}
              className="mt-4 w-full rounded-xl py-2.5 bg-grad-cool text-white font-semibold disabled:opacity-60"
            >
              {extracted.length > 0 ? "Add all to cart" : "No medicines extracted yet"}
            </button>

          </div>
        </div>
      </Section>
    </PageShell>
  );
}
