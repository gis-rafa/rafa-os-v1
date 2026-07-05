"use server";

import { revalidatePath } from "next/cache";
import { buildRoutedPrompt } from "@/lib/context-router";
import { getActionUser } from "@/lib/auth-user";
import {
  saveMemorySuggestion,
  suggestMemoryFromConversation,
  type MemorySuggestion
} from "@/lib/memories";

export async function buildChatPromptAction(userMessage: string) {
  const user = await getActionUser();
  return buildRoutedPrompt(userMessage, user.id);
}

export async function saveAssistantMemoryAction(formData: FormData) {
  const user = await getActionUser();
  const content = String(formData.get("content") ?? "").trim();
  const title =
    String(formData.get("title") ?? "").trim() || createMemoryTitle(content);
  const category =
    String(formData.get("category") ?? "").trim() || "Conversation";
  const tags = String(formData.get("tags") ?? "chat, assistant")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const importance = clampImportance(Number(formData.get("importance") ?? 3));

  if (!content) {
    return {
      ok: false,
      message: "There is no assistant response to save."
    };
  }

  await saveMemorySuggestion(user.id, {
    category,
    title,
    content,
    tags,
    importance
  });

  revalidatePath("/memory");

  return {
    ok: true,
    message: "Saved to Memory."
  };
}

export async function suggestMemoryAction({
  assistantResponse,
  userMessage
}: {
  assistantResponse: string;
  userMessage: string;
}) {
  const user = await getActionUser();
  const suggestion = await suggestMemoryFromConversation({
    assistantResponse,
    userId: user.id,
    userMessage
  });

  return {
    suggestion
  };
}

export async function saveMemorySuggestionAction(formData: FormData) {
  const user = await getActionUser();
  const suggestion: MemorySuggestion = {
    category: String(formData.get("category") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    importance: clampImportance(Number(formData.get("importance") ?? 3))
  };
  const existingMemoryId = String(formData.get("existingMemoryId") ?? "").trim();

  if (existingMemoryId) {
    suggestion.existingMemoryId = existingMemoryId;
  }

  if (!suggestion.category || !suggestion.title || !suggestion.content) {
    return {
      ok: false,
      message: "Title, category, and content are required."
    };
  }

  await saveMemorySuggestion(user.id, suggestion);
  revalidatePath("/memory");

  return {
    ok: true,
    message: "Saved to Memory."
  };
}

function createMemoryTitle(content: string) {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return (firstLine ?? "Assistant response").slice(0, 80);
}

function clampImportance(value: number) {
  if (!Number.isFinite(value)) {
    return 3;
  }

  return Math.min(Math.max(Math.round(value), 1), 5);
}
