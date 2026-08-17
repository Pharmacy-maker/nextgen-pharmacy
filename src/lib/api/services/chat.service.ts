import { mockDelay } from "../client";
import type {
  ChatConversation,
  ChatMessage,
  ChatReply,
  ID,
} from "../../../types/models";

export type SendMessageInput = {
  conversationId: ID;
  messages: ChatMessage[];
  userId?: ID;
};

const STORAGE_KEY = "rays:chat";

function readStore(): Record<ID, ChatConversation> {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}"
    );
  } catch {
    return {};
  }
}

function writeStore(store: Record<ID, ChatConversation>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(store)
    );
  } catch {
    // ignore
  }
}

export function createMessage(
  role: ChatMessage["role"],
  content: string
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export const chatService = {
  async history(
    conversationId: ID
  ): Promise<ChatConversation | null> {
    return readStore()[conversationId] ?? null;
  },

  async saveHistory(
    conversation: ChatConversation
  ): Promise<void> {
    const store = readStore();
    store[conversation.id] = conversation;
    writeStore(store);
  },

  async clear(conversationId: ID): Promise<void> {
    const store = readStore();
    delete store[conversationId];
    writeStore(store);
  },

  async sendMessage(
    input: SendMessageInput
  ): Promise<ChatReply> {
    const reply: ChatReply = {
      conversationId: input.conversationId,
      message: createMessage(
        "assistant",
        "AI chat is not connected yet. You can browse medicines, upload a prescription, or track your orders."
      ),
      suggestions: [
        "Browse medicines",
        "Upload prescription",
        "Track my order",
      ],
    };

    return mockDelay(reply, 500);
  },
};