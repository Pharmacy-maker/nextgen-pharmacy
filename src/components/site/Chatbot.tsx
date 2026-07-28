import { useState } from "react";
import { Bot, Send, X } from "lucide-react";

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([
    { me: false, t: "Hi! I'm Rays AI. Ask me about medicines, symptoms, or upload a prescription." },
  ]);
  const [typing, setTyping] = useState(false);
  const [txt, setTxt] = useState("");
  const send = (v: string) => {
    if (!v.trim()) return;
    setMsgs((m) => [...m, { me: true, t: v }]);
    setTxt("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [
        ...m,
        { me: false, t: "Thanks! I've noted that. For clinical advice please consult a licensed doctor — meanwhile I can suggest OTC options or add items to your cart." },
      ]);
    }, 1200);
  };
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-grad-hero grid place-items-center glow hover-lift"
        aria-label="Open chat"
      >
        <Bot className="h-6 w-6 text-white" />
        <span className="absolute inset-0 rounded-full bg-grad-hero blur-xl opacity-60 -z-10 animate-pulse-glow" />
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[92vw] max-w-sm glass-strong rounded-3xl overflow-hidden animate-rise glow">
          <div className="p-4 bg-grad-hero flex items-center gap-3 text-white">
            <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center"><Bot className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">Rays AI</div>
              <div className="text-xs opacity-80">Always online</div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 h-72 overflow-y-auto space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.me ? "bg-grad-cool text-white" : "bg-white/10"}`}>{m.t}</div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-1 items-center bg-white/10 w-fit px-3 py-2 rounded-2xl">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-white typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2 mb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["Fever meds", "Skin care", "Track order"].map((s) => (
                <button key={s} onClick={() => send(s)} className="shrink-0 text-xs px-3 py-1 rounded-full glass hover:bg-white/15">{s}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(txt)}
                placeholder="Ask anything…"
                className="flex-1 bg-white/5 rounded-xl px-3 py-2 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <button onClick={() => send(txt)} className="h-9 w-9 rounded-xl bg-grad-hero grid place-items-center glow" aria-label="Send">
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
