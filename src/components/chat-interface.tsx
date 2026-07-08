"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import {
  buildChatPromptAction,
  saveAssistantMemoryAction,
  saveMemorySuggestionAction,
  suggestMemoryAction
} from "@/app/chat/actions";
import type { MorningBrief } from "@/lib/morning-brief";
import type { Message, MemorySuggestionState } from "@/lib/chat-types";
import {
  MemorySuggestionCard,
  DeveloperPanel,
  MorningBriefHeader,
  MessageBubble,
  LoadingBubble
} from "@/components/chat";
import { createMemoryTitle } from "@/lib/chat-utils";

export function ChatInterface({
  morningBrief
}: {
  morningBrief: MorningBrief;
}) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "assistant-1",
      role: "assistant",
      content:
        "Good morning, Rafa. I have your Master Brain, Active Context, Morning Brief, and Knowledge Index ready. Tell me what you want to move forward, and I will keep the answer tied to your mission, focus, health, relationship context, and GIS roadmap."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedMemoryIds, setSavedMemoryIds] = useState<Set<string>>(
    () => new Set()
  );
  const [savingMemoryId, setSavingMemoryId] = useState<string | null>(null);
  const [memorySuggestion, setMemorySuggestion] =
    useState<MemorySuggestionState | null>(null);
  const [isSavingSuggestion, setIsSavingSuggestion] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [developerPanel, setDeveloperPanel] = useState(
    "Send a message to see the Context Router report and complete prompt."
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedInput
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMemorySuggestion(null);
    setInput("");
    setIsLoading(true);
    let assistantMessageId: string | null = null;
    let assistantResponseContent = "";

    try {
      const { prompt, report } = await buildChatPromptAction(trimmedInput);
      setDeveloperPanel([report, "", "## Complete Prompt", prompt].join("\n"));

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: ""
      };

      assistantMessageId = assistantMessage.id;
      setMessages((currentMessages) => [...currentMessages, assistantMessage]);

      const response = await fetch("/api/chat", {
        body: JSON.stringify({ prompt }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(errorText || "OpenAI API request failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantResponseContent += chunk;

        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: message.content + chunk }
              : message
          )
        );
      }

      if (assistantResponseContent.trim()) {
        const { suggestion } = await suggestMemoryAction({
          assistantResponse: assistantResponseContent,
          userMessage: trimmedInput
        });

        setMemorySuggestion(suggestion);
      }
    } catch (error) {
      const errorContent =
        error instanceof Error
          ? `OpenAI API error: ${error.message}`
          : "OpenAI API error: I could not generate a response.";

      if (assistantMessageId) {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: errorContent }
              : message
          )
        );

        return;
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: errorContent
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = async (message: Message) => {
    await navigator.clipboard.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  const saveMessageToMemory = async (message: Message) => {
    if (!message.content.trim() || savingMemoryId) {
      return;
    }

    setSavingMemoryId(message.id);
    setMemoryError(null);

    try {
      const formData = new FormData();
      formData.set("content", message.content);
      formData.set("title", createMemoryTitle(message.content));
      formData.set("category", "Conversation");
      formData.set("tags", "chat, assistant");
      formData.set("importance", "3");

      const result = await saveAssistantMemoryAction(formData);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setSavedMemoryIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(message.id);
        return nextIds;
      });
    } catch (error) {
      setMemoryError(
        error instanceof Error
          ? error.message
          : "Could not save this response to Memory."
      );
    } finally {
      setSavingMemoryId(null);
    }
  };

  const saveSuggestionToMemory = async (suggestion: MemorySuggestionState) => {
    if (isSavingSuggestion) {
      return;
    }

    setIsSavingSuggestion(true);
    setMemoryError(null);

    try {
      const formData = new FormData();
      formData.set("title", suggestion.title);
      formData.set("category", suggestion.category);
      formData.set("content", suggestion.content);
      formData.set("tags", suggestion.tags.join(", "));
      formData.set("importance", String(suggestion.importance));

      if (suggestion.existingMemoryId) {
        formData.set("existingMemoryId", suggestion.existingMemoryId);
      }

      const result = await saveMemorySuggestionAction(formData);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setMemorySuggestion(null);
    } catch (error) {
      setMemoryError(
        error instanceof Error
          ? error.message
          : "Could not save this memory suggestion."
      );
    } finally {
      setIsSavingSuggestion(false);
    }
  };

  return (
    <section className="mx-auto grid max-h-none min-h-[calc(100dvh-7rem)] max-w-7xl gap-4 overflow-visible xl:h-[calc(100vh-8.5rem)] xl:grid-cols-[minmax(0,1fr)_420px] xl:overflow-hidden">
      <div className="flex min-h-[70dvh] flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm hover:shadow-md xl:min-h-0">
        <div className="border-b border-stone-200/80 px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            RAFA AI
          </p>
          <h2 className="mt-1 text-xl font-semibold text-stone-950 sm:text-2xl">
            Talk to Rafa
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
          <div className="space-y-5">
            <MorningBriefHeader morningBrief={morningBrief} />

            {messages.map((message) => (
              <MessageBubble
                copied={copiedId === message.id}
                key={message.id}
                message={message}
                onCopy={() => void copyMessage(message)}
                onSaveToMemory={() => void saveMessageToMemory(message)}
                savedToMemory={savedMemoryIds.has(message.id)}
                savingToMemory={savingMemoryId === message.id}
              />
            ))}

            {isLoading ? <LoadingBubble /> : null}
            {memorySuggestion ? (
              <MemorySuggestionCard
                isSaving={isSavingSuggestion}
                key={`${memorySuggestion.existingMemoryId ?? "new"}-${memorySuggestion.title}-${memorySuggestion.content}`}
                onDismiss={() => setMemorySuggestion(null)}
                onSave={(suggestion) => void saveSuggestionToMemory(suggestion)}
                suggestion={memorySuggestion}
              />
            ) : null}
            {memoryError ? (
              <p className="rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-sm text-red-700">
                {memoryError}
              </p>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-stone-200 bg-stone-50 p-3 sm:p-4">
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <label className="sr-only" htmlFor="chat-message">
              Message
            </label>
            <textarea
              className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-stone-200/80 bg-white px-3 py-3 text-sm leading-6 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-400 sm:max-h-36 sm:px-4"
              id="chat-message"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Talk to Rafa..."
              value={input}
            />
            <button
              aria-label="Send message"
              className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white transition hover:bg-stone-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-stone-300"
              disabled={!input.trim() || isLoading}
              type="submit"
            >
              <Send size={18} strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>

      <DeveloperPanel content={developerPanel} />
    </section>
  );
}
