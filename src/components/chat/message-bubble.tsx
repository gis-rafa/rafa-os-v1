"use client";

import { Check, Copy, Database } from "lucide-react";
import { Avatar } from "./avatar";
import { MarkdownContent } from "./markdown-content";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function MessageBubble({
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
          className={`rounded-xl px-4 py-3 text-sm leading-7 ${
            isUser
              ? "bg-stone-900 text-white"
              : "border border-stone-200/80 bg-stone-50/60 text-stone-800"
          }`}
        >
          <MarkdownContent content={message.content} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-800"
            onClick={onCopy}
            type="button"
          >
            {copied ? (
              <Check size={14} strokeWidth={2} />
            ) : (
              <Copy size={14} strokeWidth={2} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          {!isUser ? (
            <button
              className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-800 disabled:cursor-not-allowed disabled:text-stone-400"
              disabled={savedToMemory || savingToMemory || !message.content.trim()}
              onClick={onSaveToMemory}
              type="button"
            >
              {savedToMemory ? (
                <Check size={14} strokeWidth={2} />
              ) : (
                <Database size={14} strokeWidth={2} />
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
