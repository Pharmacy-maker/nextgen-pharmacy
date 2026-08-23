import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";

import { chatService } from "../../lib/services/chatService";
import { supabase } from "../../lib/supabase";
import type { ChatMessage } from "../../types/models";

type ChatbotProps = {
  className?: string;
};

const createLocalMessage = (
  role: "user" | "assistant",
  content: string
): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  createdAt: new Date().toISOString(),
});

export function Chatbot({
  className = "",
}: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] =
    useState<string>("default");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     INITIAL GREETING
  ========================================================= */

  useEffect(() => {
    setMessages([
      createLocalMessage(
        "assistant",
        "Hello! Welcome to Rays Pharmacy. How can I help you?"
      ),
    ]);
  }, []);

  /* =========================================================
     SCROLL TO LATEST MESSAGE
  ========================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =========================================================
     SEND MESSAGE
     LOGIN IS REQUIRED
  ========================================================= */

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    /* =====================================================
       CHECK IF USER IS LOGGED IN
    ===================================================== */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    /* =====================================================
       USER IS NOT LOGGED IN
    ===================================================== */

    if (authError || !user) {
      setMessages((previous) => [
        ...previous,
        createLocalMessage(
          "assistant",
          "Please login to use the chatbot."
        ),
      ]);

      return;
    }

    /* =====================================================
       USER IS LOGGED IN
    ===================================================== */

    setInput("");

    const userMessage = createLocalMessage(
      "user",
      text
    );

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      const reply = await chatService.sendMessage({
        conversationId,
        messages: updatedMessages,
        userId: user.id,
      });

      setConversationId(
        reply.conversationId
      );

      setMessages((previous) => [
        ...previous,
        reply.message,
      ]);
    } catch (error) {
      console.error(
        "Chatbot error:",
        error
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessages((previous) => [
        ...previous,
        createLocalMessage(
          "assistant",
          errorMessage
        ),
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     ENTER KEY
  ========================================================= */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  /* =========================================================
     SUGGESTIONS
  ========================================================= */

  const handleSuggestion = (
    suggestion: string
  ) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* =====================================================
          CHAT BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/30 bg-gradient-to-br from-[#168BFF] to-[#A855F7] text-white shadow-[0_8px_35px_rgba(20,184,232,0.35)] transition-all duration-200 hover:scale-105 hover:shadow-[0_10px_45px_rgba(168,85,247,0.45)] ${className}`}
        aria-label="Open chatbot"
      >
        <Bot
          size={27}
          strokeWidth={1.8}
        />
      </button>

      {/* =====================================================
          CHAT WINDOW
      ===================================================== */}

      {open && (
        <div className="fixed bottom-6 right-6 z-[100] flex h-[600px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#020817] text-white shadow-[0_20px_70px_rgba(0,0,0,0.65)]">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="relative flex items-center justify-between overflow-hidden border-b border-cyan-300/10 bg-gradient-to-r from-[#061B3A] via-[#063B55] to-[#08152E] px-5 py-4">

            <div className="pointer-events-none absolute -right-10 -top-16 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="pointer-events-none absolute -left-10 -bottom-20 h-32 w-32 rounded-full bg-purple-500/15 blur-3xl" />

            <div className="relative flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-300 shadow-[0_0_20px_rgba(20,184,232,0.15)]">
                <Bot
                  size={21}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold tracking-wide text-white">
                  Rays AI
                </h2>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />

                  <p className="text-[11px] text-cyan-100/60">
                    Rays Pharmacy Assistant
                  </p>
                </div>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg text-cyan-100/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chatbot"
            >
              <X size={19} />
            </button>

          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#020817] via-[#031326] to-[#020817] px-5 py-5">

            <div className="space-y-5">

              {messages.map((message) => (

                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  {/* =================================================
                      ASSISTANT MESSAGE
                  ================================================= */}

                  {message.role === "assistant" ? (

                    <div className="flex max-w-[88%] gap-3">

                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-300/15 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-cyan-300">
                        <Bot
                          size={15}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="rounded-2xl rounded-tl-md border border-cyan-300/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                        {message.content}
                      </div>

                    </div>

                  ) : (

                    /* =================================================
                       USER MESSAGE
                    ================================================= */

                    <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-gradient-to-r from-[#168BFF] to-[#A855F7] px-4 py-3 text-sm leading-6 text-white shadow-[0_6px_25px_rgba(37,99,235,0.25)]">
                      {message.content}
                    </div>

                  )}

                </div>

              ))}

              {/* =================================================
                  TYPING INDICATOR
              ================================================= */}

              {loading && (
                <div className="flex max-w-[88%] gap-3">

                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-300/15 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-cyan-300">
                    <Bot
                      size={15}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="rounded-2xl rounded-tl-md border border-cyan-300/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-cyan-100/50">
                    Typing...
                  </div>

                </div>
              )}

              <div ref={messagesEndRef} />

            </div>
          </div>

          {/* =================================================
              SUGGESTIONS
          ================================================= */}

          <div className="border-t border-cyan-300/10 bg-[#031124] px-4 py-3">

            <div className="flex gap-2 overflow-x-auto pb-1">

              {[
                "Browse medicines",
                "Upload prescription",
                "Track my order",
              ].map((suggestion) => (

                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    handleSuggestion(suggestion)
                  }
                  className="whitespace-nowrap rounded-lg border border-cyan-300/15 bg-gradient-to-r from-[#082542] to-[#101D3D] px-3 py-2 text-[11px] text-cyan-100/75 transition hover:border-cyan-300/35 hover:bg-[#0B3150] hover:text-white hover:shadow-[0_0_15px_rgba(20,184,232,0.12)]"
                >
                  {suggestion}
                </button>

              ))}

            </div>

          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="border-t border-cyan-300/10 bg-[#020D1D] p-4">

            <div className="flex items-center gap-3">

              <input
                type="text"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={loading}
                className="min-w-0 flex-1 rounded-xl border border-cyan-300/10 bg-[#071A30] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400/40 focus:bg-[#09213A] focus:shadow-[0_0_20px_rgba(20,184,232,0.08)] disabled:opacity-50"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={
                  loading ||
                  !input.trim()
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#14B8E8] via-[#168BFF] to-[#A855F7] text-white shadow-[0_5px_20px_rgba(20,184,232,0.25)] transition hover:scale-105 hover:shadow-[0_6px_25px_rgba(168,85,247,0.35)] disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Send message"
              >
                <Send
                  size={18}
                  strokeWidth={2}
                />
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}