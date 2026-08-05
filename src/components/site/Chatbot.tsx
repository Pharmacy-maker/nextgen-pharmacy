import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { chatService, createMessage } from "../../lib/api";
import { useAuth } from "../../lib/store";
import type { ChatMessage } from "../../types/models";

const CONVERSATION_ID = "default";

const GREETING = createMessage(
  "assistant",
  "Hi! I'm Rays AI. Ask me about medicines, dosages, orders, or upload a prescription.",
);

/**
 * Chat UI shell. All intelligence comes from `chatService`, so connecting a
 * backend AI endpoint requires no changes here.
 */
export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [suggestions, setSuggestions] = useState<string[]>(["Fever meds", "Skin care", "Track order"]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txt, setTxt] = useState("");
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore persisted conversation history.
  useEffect(() => {
    let alive = true;
    chatService.history(CONVERSATION_ID).then((c) => {
      if (alive && c?.messages?.length) setMessages(c.messages);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (v: string) => {
    if (!v.trim() || sending) return;
    setError(null);
    const next = [...messages, createMessage("user", v.trim())];
    setMessages(next);
    setTxt("");
    setSending(true);
    try {
      const reply = await chatService.sendMessage({
        conversationId: CONVERSATION_ID,
        messages: next,
        userId: user?.id,
      });
      const history = [...next, reply.message];
      setMessages(history);
      if (reply.suggestions) setSuggestions(reply.suggestions);
      void chatService.saveHistory({
        id: CONVERSATION_ID,
        userId: user?.id,
        messages: history,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reach the assistant. Please try again.");
    } finally {
      setSending(false);
    }
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
          <div ref={scrollRef} className="p-4 h-72 overflow-y-auto space-y-3" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-grad-cool text-white" : "bg-white/10"}`}>{m.content}</div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-1 items-center bg-white/10 w-fit px-3 py-2 rounded-2xl">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-white typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
            {error && <div className="text-xs text-pink" role="alert">{error}</div>}
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2 mb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="shrink-0 text-xs px-3 py-1 rounded-full glass hover:bg-white/15">{s}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(txt)}
                placeholder="Ask anything…"
                aria-label="Message Rays AI"
                className="flex-1 bg-white/5 rounded-xl px-3 py-2 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <button onClick={() => send(txt)} disabled={sending} className="h-9 w-9 rounded-xl bg-grad-hero grid place-items-center glow disabled:opacity-60" aria-label="Send">
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
