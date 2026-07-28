import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Brain, CheckCircle2, Sparkles, Upload, X } from "lucide-react";
import { PageShell, Section } from "../components/site/Section";
import {
  PRESCRIPTION_MAX_BYTES,
  PRESCRIPTION_MIME,
  validatePrescription,
} from "../lib/validation";
import { useCart } from "../lib/store";
import { products } from "../lib/products";
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

function PrescriptionPage() {
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { add } = useCart();

  const acceptFile = (f: File | null) => {
    setError(null);
    setComplete(false);
    if (!f) return;
    const err = validatePrescription(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    setScanning(true);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setScanning(false);
          setComplete(true);
          return 100;
        }
        return p + 4;
      });
    }, 80);
  };

  const extracted = products.slice(0, 4);

  const addAll = () => {
    extracted.forEach((p) => add(p.id, 1));
    toast.success("Added extracted medicines to your cart");
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
                {scanning && <div className="absolute inset-0 rounded-2xl border-2 border-neon animate-pulse-glow" />}
              </div>
              <div>
                <div className="font-semibold text-lg">Drop prescription here</div>
                <div className="text-muted-foreground text-sm">
                  or click to browse • JPG, JPEG, PNG or PDF • up to {Math.round(PRESCRIPTION_MAX_BYTES / 1024 / 1024)}MB
                </div>
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 bg-grad-hero text-white font-semibold glow"
              >
                <Sparkles className="h-4 w-4" /> {file ? "Choose different file" : "Choose file"}
              </button>
              {file && (
                <div className="w-full flex items-center justify-between gap-3 glass rounded-xl px-3 py-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => {
                      setFile(null);
                      setProgress(0);
                      setComplete(false);
                    }}
                    className="h-6 w-6 grid place-items-center rounded-md hover:bg-white/10"
                    aria-label="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {error && <div className="w-full text-sm text-pink text-left">{error}</div>}
              {(scanning || progress > 0) && !error && (
                <div className="w-full mt-2">
                  <div className="flex justify-between text-xs mb-2">
                    <span>{scanning ? "AI scanning…" : "Scan complete"}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-grad-neon transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-3xl glass p-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple/40 blur-3xl" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Brain className="h-4 w-4 text-neon" /> AI extraction preview
            </div>
            {extracted.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">1 pack • as prescribed</div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald" />
              </div>
            ))}
            <button
              disabled={!complete}
              onClick={addAll}
              className="mt-4 w-full rounded-xl py-2.5 bg-grad-cool text-white font-semibold disabled:opacity-60"
            >
              {complete ? "Add all to cart" : "Upload a prescription to enable"}
            </button>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
