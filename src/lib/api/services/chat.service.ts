import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import type { ChatConversation, ChatMessage, ChatReply, ID } from "../../../types/models";

/**
 * Chatbot service — frontend only.
 *
 * The assistant's intelligence lives entirely in the backend. This module
 * defines the request/response contract (conversation id + full message
 * history in, one assistant message out) so an AI backend can be plugged in
 * by implementing `POST /chat/messages` — no UI change required.
 *
 * Planned backend capabilities: medicine information, dosage guidance,
 * pharmacy FAQs, order tracking lookups and general customer support.
 */

export type SendMessageInput = {
  conversationId: ID;
  /** Full history, oldest first — the model is stateless. */
  messages: ChatMessage[];
  userId?: ID;
};

const STORAGE_KEY = "rays:chat";

function readStore(): Record<ID, ChatConversation> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeStore(store: Record<ID, ChatConversation>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export const chatService = {
  /** Persisted conversation history (replaced by a backend read later). */
  async history(conversationId: ID): Promise<ChatConversation | null> {
    if (!USE_MOCK_API)
      return apiFetch<ChatConversation>(ENDPOINTS.chat.conversation(conversationId));
    return readStore()[conversationId] ?? null;
  },

  /** Persists the local transcript so history survives reloads. */
  async saveHistory(conversation: ChatConversation): Promise<void> {
    if (!USE_MOCK_API) return;
    const store = readStore();
    store[conversation.id] = conversation;
    writeStore(store);
  },

  async clear(conversationId: ID): Promise<void> {
    if (!USE_MOCK_API) return;
    const store = readStore();
    delete store[conversationId];
    writeStore(store);
  },

  /**
   * Sends the conversation to the AI backend and returns its reply.
   *
   * No mock answers are invented here: until a backend is connected the
   * assistant honestly reports that it is not available yet.
   */
  async sendMessage(input: SendMessageInput): Promise<ChatReply> {
    if (!USE_MOCK_API) {
      return apiFetch<ChatReply>(ENDPOINTS.chat.send, { method: "POST", body: input });
    }
    return mockDelay(
      {
        conversationId: input.conversationId,
        message: createMessage(
          "assistant",
          "The AI assistant isn't connected yet — replies will appear here once the backend AI service is live. In the meantime you can browse medicines, upload a prescription, or track an order from your account.",
        ),
        suggestions: ["Browse medicines", "Upload prescription", "Track my order"],
      },
      900,
    );
  },
};
