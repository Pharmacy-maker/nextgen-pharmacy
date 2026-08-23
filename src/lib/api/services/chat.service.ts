import { supabase } from "../../supabase";
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

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(
  text: string,
  keywords: string[]
): boolean {
  return keywords.some((keyword) =>
    text.includes(keyword)
  );
}

function getResponse(userMessage: string): string {
  const text = normalizeText(userMessage);

  // =========================
  // GREETINGS
  // =========================
  if (
    containsAny(text, [
      "hello",
      "hi",
      "hey",
      "hai",
      "hii",
      "hiii",
      "good morning",
      "good afternoon",
      "good evening",
      "namaste",
    ])
  ) {
    return "Hello! Welcome to Rays Pharmacy. How can I help you?";
  }

  // =========================
  // THANK YOU
  // =========================
  if (
    containsAny(text, [
      "thank you",
      "thanks",
      "thank u",
      "thankyou",
      "thx",
      "thanks a lot",
    ])
  ) {
    return "You're welcome! I'm happy to help.";
  }

  // =========================
  // GOODBYE
  // =========================
  if (
    containsAny(text, [
      "bye",
      "goodbye",
      "good bye",
      "see you",
      "see ya",
    ])
  ) {
    return "Goodbye! Thank you for using Rays Pharmacy.";
  }

  // =========================
  // GENERAL HELP
  // =========================
  if (
    containsAny(text, [
      "help me",
      "i need help",
      "i need some help",
      "can you help me",
      "can u help me",
      "could you help me",
      "please help me",
      "i need assistance",
      "i need support",
      "i have a question",
      "i have a query",
      "what can you help me with",
      "how can you help",
      "what can you do",
      "what do you do",
      "what services do you provide",
    ])
  ) {
    return "I'm Rays AI, the virtual assistant for Rays Pharmacy. I can help you with products, prescriptions, orders, delivery information, and general pharmacy information.";
  }

  // =========================
  // ABOUT CHATBOT
  // =========================
  if (
    containsAny(text, [
      "who are you",
      "what are you",
      "are you a bot",
      "are you an ai",
      "what is rays ai",
      "tell me about yourself",
    ])
  ) {
    return "I'm Rays AI, the virtual assistant for Rays Pharmacy. I can help you with products, prescriptions, orders, delivery information, and general pharmacy information.";
  }

  // =========================
  // HEALTH / SYMPTOMS
  // =========================
  if (
    containsAny(text, [
      "fever",
      "high fever",
      "mild fever",
      "low fever",
      "feverish",
      "feeling feverish",
      "body is hot",
      "body feels hot",
      "my body is hot",
      "temperature",
      "high temperature",

      "headache",
      "head pain",
      "my head hurts",
      "my head is hurting",
      "head is hurting",
      "pain in my head",

      "stomach pain",
      "stomach ache",
      "stomach hurts",
      "my stomach hurts",
      "my stomach is hurting",
      "my stomach is paining",
      "pain in my stomach",
      "abdominal pain",
      "abdomen pain",

      "body pain",
      "body ache",
      "body aches",
      "my body hurts",
      "whole body pain",
      "back pain",
      "back ache",
      "chest pain",
      "tooth pain",
      "toothache",
      "ear pain",
      "eye pain",
      "throat pain",
      "sore throat",

      "running nose",
      "runny nose",
      "my nose is running",
      "nose is running",
      "blocked nose",
      "stuffy nose",
      "nasal congestion",
      "cold",
      "common cold",

      "cough",
      "coughing",
      "dry cough",
      "wet cough",
      "bad cough",

      "vomiting",
      "vomit",
      "i am vomiting",
      "feeling nauseous",
      "nausea",
      "nauseous",
      "feel like vomiting",

      "dizzy",
      "dizziness",
      "feeling dizzy",
      "i feel dizzy",
      "weakness",
      "feeling weak",
      "i feel weak",
      "tired",
      "very tired",
      "fatigue",

      "feeling sick",
      "feel sick",
      "i am sick",
      "i feel sick",
      "not feeling well",
      "i am not feeling well",
      "feeling unwell",
      "health problem",
      "health issue",
      "symptom",
      "symptoms",
      "rash",
      "itching",
      "swelling",
      "diarrhea",
      "diarrhoea",
      "loose motion",
      "constipation",

      "breathing problem",
      "breathing difficulty",
      "difficulty breathing",
      "shortness of breath",

      "what is wrong with me",
      "am i sick",
      "what disease",
      "which disease",
      "is this serious",
      "what should i do",
      "what can i do",

      "medicine should i take",
      "what medicine should i take",
      "which medicine should i take",
      "which tablet should i take",
      "what tablet should i take",
      "what medicine can i take",
      "which medicine can i use",
      "what tablet can i take",
      "dosage",
      "dose",
      "how much medicine",
    ])
  ) {
    return "For health-related concerns, please consult a qualified healthcare professional for appropriate advice.";
  }

  // =========================
  // PRODUCTS / MEDICINES
  // =========================
  if (
    containsAny(text, [
      "products",
      "product",
      "medicines",
      "medicine",
      "medication",
      "tablets",
      "tablet",
      "capsules",
      "capsule",
      "syrup",
      "drugs",
      "pharmacy products",
      "available medicines",
      "available products",
      "browse medicines",
      "browse products",
      "show medicines",
      "show products",
      "medicine catalogue",
      "medicine catalog",
      "product catalogue",
      "product catalog",
      "what medicines do you have",
      "what products do you have",
      "where can i find medicines",
      "where can i find products",
      "see medicines",
      "see products",
      "medicine list",
      "product list",
      "show me medicines",
      "show me products",
      "do you sell medicines",
      "do you sell medicine",
      "do you have medicines",
      "do you have medicine",
      "what do you sell",
    ])
  ) {
    return "Please go to the Products section to view the available medicines and products.";
  }

  // =========================
  // PRESCRIPTION
  // =========================
  if (
    containsAny(text, [
      "prescription",
      "prescription upload",
      "upload prescription",
      "upload my prescription",
      "submit prescription",
      "send prescription",
      "add prescription",
      "prescription file",
      "prescription document",
      "doctor prescription",
      "where to upload prescription",
      "how to upload prescription",
      "how can i upload prescription",
    ])
  ) {
    return "You can upload your prescription using the Upload Prescription option.";
  }

  // =========================
  // ORDERS
  // =========================
  if (
    containsAny(text, [
      "track order",
      "track my order",
      "order status",
      "check order",
      "check my order",
      "where is my order",
      "where is my medicine",
      "where is my package",
      "order tracking",
      "track delivery",
      "delivery status",
      "my order",
      "my orders",
      "ordered medicine",
      "where is my delivery",
    ])
  ) {
    return "Please go to the Orders section to check and track your order.";
  }

  // =========================
  // DELIVERY
  // =========================
  if (
    containsAny(text, [
      "delivery",
      "deliver",
      "home delivery",
      "delivery available",
      "do you deliver",
      "can you deliver",
      "delivery service",
      "how long delivery",
      "delivery time",
      "when will it arrive",
    ])
  ) {
    return "For delivery-related information, please check the Orders or Delivery section of Rays Pharmacy.";
  }

  // =========================
  // FALLBACK
  // =========================
  return "Sorry, I don't have an answer for that yet. Please contact the pharmacy for assistance.";
}

export const chatService = {
  // ============================================================
  // LOAD CHAT HISTORY
  // ============================================================

  async history(
    conversationId: ID
  ): Promise<ChatConversation | null> {
    if (
      !conversationId ||
      conversationId === "default"
    ) {
      return null;
    }

    const {
      data: conversation,
      error: conversationError,
    } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError) {
      console.error(
        "History conversation error:",
        conversationError
      );

      return null;
    }

    if (!conversation) {
      return null;
    }

    const {
      data: messages,
      error: messagesError,
    } = await supabase
      .from("chat_messages")
      .select("*")
      .eq(
        "conversation_id",
        conversationId
      )
      .order("created_at", {
        ascending: true,
      });

    if (messagesError) {
      console.error(
        "History messages error:",
        messagesError
      );

      return {
        id: conversation.id,
        messages: [],
      } as ChatConversation;
    }

    return {
      id: conversation.id,
      messages: (messages ?? []).map(
        (message) => ({
          id: message.id,
          role: message.role,
          content: message.content ?? "",
          createdAt: message.created_at,
        })
      ),
    } as ChatConversation;
  },

  // ============================================================
  // SAVE COMPLETE HISTORY
  // ============================================================

  async saveHistory(
    conversation: ChatConversation
  ): Promise<void> {
    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !userData.user
    ) {
      console.error(
        "No authenticated user found:",
        userError
      );

      return;
    }

    const userId = userData.user.id;

    const conversationId =
      conversation.id === "default" ||
      !conversation.id
        ? crypto.randomUUID()
        : conversation.id;

    const {
      error: conversationError,
    } = await supabase
      .from("chat_conversations")
      .upsert({
        id: conversationId,
        user_id: userId,
        updated_at:
          new Date().toISOString(),
      });

    if (conversationError) {
      console.error(
        "Save conversation error:",
        conversationError
      );

      throw new Error(
        `Unable to save conversation: ${conversationError.message}`
      );
    }

    for (const message of conversation.messages) {
      const messageId =
        message.id.startsWith("msg-")
          ? crypto.randomUUID()
          : message.id;

      const {
        error: messageError,
      } = await supabase
        .from("chat_messages")
        .upsert({
          id: messageId,
          conversation_id:
            conversationId,
          role: message.role,
          content: message.content,
          created_at:
            message.createdAt ||
            new Date().toISOString(),
        });

      if (messageError) {
        console.error(
          "Save message error:",
          messageError
        );

        throw new Error(
          `Unable to save message: ${messageError.message}`
        );
      }
    }
  },

  // ============================================================
  // CLEAR CHAT
  // ============================================================

  async clear(
    conversationId: ID
  ): Promise<void> {
    if (
      !conversationId ||
      conversationId === "default"
    ) {
      return;
    }

    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      console.error(
        "Clear conversation error:",
        error
      );

      throw new Error(
        `Unable to clear conversation: ${error.message}`
      );
    }
  },

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  async sendMessage(
    input: SendMessageInput
  ): Promise<ChatReply> {

    // ==========================================================
    // STEP 1 — CHECK LOGIN FIRST
    // ==========================================================

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !userData.user
    ) {
      throw new Error(
        "Please log in to use the chatbot."
      );
    }

    const userId = userData.user.id;

    // ==========================================================
    // STEP 2 — GET CONVERSATION ID
    // ==========================================================

    let conversationId =
      input.conversationId;

    if (
      !conversationId ||
      conversationId === "default"
    ) {
      conversationId =
        crypto.randomUUID();
    }

    // ==========================================================
    // STEP 3 — GET LAST USER MESSAGE
    // ==========================================================

    const lastMessage =
      input.messages[
        input.messages.length - 1
      ];

    if (!lastMessage) {
      throw new Error(
        "Message cannot be empty."
      );
    }

    const userMessage =
      lastMessage.content.trim();

    if (!userMessage) {
      throw new Error(
        "Message cannot be empty."
      );
    }

    // ==========================================================
    // STEP 4 — CREATE / SAVE CONVERSATION
    // ==========================================================

    const {
      error: conversationError,
    } = await supabase
      .from("chat_conversations")
      .upsert({
        id: conversationId,
        user_id: userId,
        updated_at:
          new Date().toISOString(),
      });

    if (conversationError) {
      console.error(
        "Conversation error:",
        conversationError
      );

      throw new Error(
        `Unable to create chat conversation: ${conversationError.message}`
      );
    }

    // ==========================================================
    // STEP 5 — SAVE USER MESSAGE
    // ==========================================================

    const userMessageId =
      crypto.randomUUID();

    const {
      error: userMessageError,
    } = await supabase
      .from("chat_messages")
      .insert({
        id: userMessageId,
        conversation_id:
          conversationId,
        role: "user",
        content: userMessage,
        created_at:
          new Date().toISOString(),
      });

    if (userMessageError) {
      console.error(
        "User message error:",
        userMessageError
      );

      throw new Error(
        `Unable to save user message: ${userMessageError.message}`
      );
    }

    // ==========================================================
    // STEP 6 — GENERATE ANSWER
    // ==========================================================

    const answer =
      getResponse(userMessage);

    // ==========================================================
    // STEP 7 — SAVE ASSISTANT MESSAGE
    // ==========================================================

    const assistantMessageId =
      crypto.randomUUID();

    const {
      error: assistantError,
    } = await supabase
      .from("chat_messages")
      .insert({
        id: assistantMessageId,
        conversation_id:
          conversationId,
        role: "assistant",
        content: answer,
        created_at:
          new Date().toISOString(),
      });

    if (assistantError) {
      console.error(
        "Assistant message error:",
        assistantError
      );

      throw new Error(
        `Unable to save assistant message: ${assistantError.message}`
      );
    }

    // ==========================================================
    // STEP 8 — UPDATE CONVERSATION
    // ==========================================================

    const {
      error: updateError,
    } = await supabase
      .from("chat_conversations")
      .update({
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        conversationId
      )
      .eq(
        "user_id",
        userId
      );

    if (updateError) {
      console.error(
        "Conversation update error:",
        updateError
      );
    }

    // ==========================================================
    // STEP 9 — RETURN ANSWER
    // ==========================================================

    const assistantMessage =
      createMessage(
        "assistant",
        answer
      );

    const reply: ChatReply = {
      conversationId,

      message: {
        ...assistantMessage,
        id: assistantMessageId,
      },

      suggestions: [
        "Browse medicines",
        "Upload prescription",
        "Track my order",
      ],
    };

    return reply;
  },
};