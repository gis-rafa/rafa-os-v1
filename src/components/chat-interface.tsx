"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  Pencil,
  Map as MapIcon,
  Save,
  Send,
  Target,
  Trophy,
  X
} from "lucide-react";
import {
  buildChatPromptAction,
  saveAssistantMemoryAction,
  saveMemorySuggestionAction,
  suggestMemoryAction
} from "@/app/chat/actions";
import type { MorningBrief } from "@/lib/morning-brief";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type MemorySuggestionState = {
  existingMemoryId?: string;
  mergeReason?: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  importance: number;
};

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
      <div className="flex min-h-[70dvh] flex-col overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm xl:min-h-0">
        <div className="border-b border-stone-200 px-4 py-4 sm:px-5">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600">
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
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
              className="max-h-32 min-h-12 flex-1 resize-none rounded-md border border-stone-200 bg-white px-3 py-3 text-sm leading-6 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-400 sm:max-h-36 sm:px-4"
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
              className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-950 text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              disabled={!input.trim() || isLoading}
              type="submit"
            >
              <Send size={18} strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </div>

      <DeveloperPanel content={developerPanel} />
    </section>
  );
}

function MemorySuggestionCard({
  isSaving,
  onDismiss,
  onSave,
  suggestion
}: {
  isSaving: boolean;
  onDismiss: () => void;
  onSave: (suggestion: MemorySuggestionState) => void;
  suggestion: MemorySuggestionState;
}) {
  const [draft, setDraft] = useState({
    ...suggestion,
    tags: suggestion.tags.join(", ")
  });

  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-800">
            <Database size={17} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-950">
              I think this is worth remembering.
            </h3>
            {suggestion.mergeReason ? (
              <p className="mt-1 text-xs text-amber-800">
                {suggestion.mergeReason}
              </p>
            ) : (
              <p className="mt-1 text-xs text-stone-600">
                Review or edit it before saving.
              </p>
            )}
          </div>
        </div>
        <button
          aria-label="Dismiss memory suggestion"
          className="inline-flex size-8 items-center justify-center rounded-md text-stone-600 transition hover:bg-amber-100 hover:text-stone-900"
          onClick={onDismiss}
          type="button"
        >
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">
            Title
          </span>
          <input
            className="h-10 rounded-md border border-amber-200 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
            value={draft.title}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">
              Category
            </span>
            <input
              className="h-10 rounded-md border border-amber-200 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  category: event.target.value
                }))
              }
              value={draft.category}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">
              Importance
            </span>
            <input
              className="h-10 rounded-md border border-amber-200 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
              max={5}
              min={1}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  importance: Number(event.target.value)
                }))
              }
              type="number"
              value={draft.importance}
            />
          </label>
        </div>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">
            Content
          </span>
          <textarea
            className="min-h-28 resize-y rounded-md border border-amber-200 bg-white p-3 text-sm leading-6 text-stone-800 outline-none transition focus:border-amber-400"
            onChange={(event) =>
              setDraft((current) => ({ ...current, content: event.target.value }))
            }
            value={draft.content}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">
            Tags
          </span>
          <input
            className="h-10 rounded-md border border-amber-200 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
            onChange={(event) =>
              setDraft((current) => ({ ...current, tags: event.target.value }))
            }
            value={draft.tags}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-200 px-4 text-sm font-medium text-stone-700 transition hover:bg-amber-100"
          onClick={onDismiss}
          type="button"
        >
          Dismiss
        </button>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={
            isSaving ||
            !draft.title.trim() ||
            !draft.category.trim() ||
            !draft.content.trim()
          }
          onClick={() =>
            onSave({
              existingMemoryId: suggestion.existingMemoryId,
              mergeReason: suggestion.mergeReason,
              title: draft.title.trim(),
              category: draft.category.trim(),
              content: draft.content.trim(),
              tags: draft.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
              importance: Math.min(Math.max(Math.round(draft.importance), 1), 5)
            })
          }
          type="button"
        >
          {isSaving ? (
            <Pencil size={16} strokeWidth={1.8} />
          ) : (
            <Save size={16} strokeWidth={1.8} />
          )}
          {isSaving ? "Saving" : "Save"}
        </button>
      </div>
    </section>
  );
}

function DeveloperPanel({ content }: { content: string }) {
  return (
    <aside className="flex min-h-80 max-h-[55dvh] flex-col overflow-hidden rounded-md border border-stone-200 bg-stone-950 text-white shadow-sm xl:max-h-none">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex size-10 items-center justify-center rounded-md bg-white/10">
          <Code2 size={18} strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Developer Panel</h3>
          <p className="mt-1 text-xs text-stone-400">
            Context routing and prompt preview
          </p>
        </div>
      </div>
      <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-5 text-stone-200">
        {content}
      </pre>
    </aside>
  );
}

function MorningBriefHeader({
  morningBrief
}: {
  morningBrief: MorningBrief;
}) {
  const items = [
    {
      title: "Primary Goal",
      value: morningBrief.primaryObjective,
      icon: Trophy
    },
    {
      title: "Today's GIS Task",
      value: morningBrief.gisStudyTask,
      icon: MapIcon
    },
    {
      title: "Weekly Priority",
      value: morningBrief.weeklyPriority,
      icon: CheckCircle2
    }
  ];

  return (
    <section className="rounded-md border border-stone-200 bg-stone-50 p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-stone-950 text-white">
            <Target size={17} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-950">
              Current Morning Brief
            </h3>
            <p className="mt-1 text-xs text-stone-600">
              {morningBrief.dateLabel} | Roadmap day {morningBrief.roadmapDay}
            </p>
          </div>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-600">
          Local context
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article
              className="rounded-md border border-stone-200 bg-white p-3"
              key={item.title}
            >
              <div className="mb-2 flex items-center gap-2 text-stone-600">
                <Icon size={15} strokeWidth={1.8} />
                <p className="text-xs font-semibold uppercase tracking-[0.1em]">
                  {item.title}
                </p>
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-stone-800">
                {item.value}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MessageBubble({
  copied,
  message,
  onCopy,
  onSaveToMemory,
  savedToMemory,
  savingToMemory
}: {
  copied: boolean;
  message: Message;
  onCopy: () => void;
  onSaveToMemory: () => void;
  savedToMemory: boolean;
  savingToMemory: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <article className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? <Avatar label="AI" /> : null}
      <div
        className={`group max-w-[calc(100%-3rem)] sm:max-w-[82%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-md px-4 py-3 text-sm leading-7 ${
            isUser
              ? "bg-stone-950 text-white"
              : "border border-stone-200 bg-stone-50 text-stone-800"
          }`}
        >
          <MarkdownContent content={message.content} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button
            className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-800"
            onClick={onCopy}
            type="button"
          >
            {copied ? (
              <Check size={14} strokeWidth={1.8} />
            ) : (
              <Copy size={14} strokeWidth={1.8} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          {!isUser ? (
            <button
              className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-800 disabled:cursor-not-allowed disabled:text-stone-400"
              disabled={savedToMemory || savingToMemory || !message.content.trim()}
              onClick={onSaveToMemory}
              type="button"
            >
              {savedToMemory ? (
                <Check size={14} strokeWidth={1.8} />
              ) : (
                <Database size={14} strokeWidth={1.8} />
              )}
              {savedToMemory
                ? "Saved"
                : savingToMemory
                  ? "Saving"
                  : "Save to Memory"}
            </button>
          ) : null}
        </div>
      </div>
      {isUser ? <Avatar label="R" /> : null}
    </article>
  );
}

function createMemoryTitle(content: string) {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^#+\s+/, ""))
    .find(Boolean);

  return (firstLine ?? "Assistant response").slice(0, 80);
}

function Avatar({ label }: { label: string }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-stone-900 text-xs font-semibold text-white">
      {label}
    </div>
  );
}

function LoadingBubble() {
  return (
    <article className="flex justify-start gap-3">
      <Avatar label="AI" />
      <div className="rounded-md border border-stone-200 bg-stone-50 px-4 py-4">
        <div className="flex gap-1.5">
          <span className="size-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.2s]" />
          <span className="size-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.1s]" />
          <span className="size-2 animate-bounce rounded-full bg-stone-400" />
        </div>
      </div>
    </article>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="space-y-3">
      {blocks.map((block) => {
        const lines = block.split(/\n/).filter(Boolean);
        const listItems = lines
          .map((line) => line.match(/^(?:-|\d+\.)\s+(.+)$/)?.[1])
          .filter((item): item is string => Boolean(item));

        if (listItems.length === lines.length) {
          return (
            <ul className="list-disc space-y-1 pl-5" key={block}>
              {listItems.map((item) => (
                <li key={item}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        return <p key={block}>{renderInlineMarkdown(block)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={part}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}
