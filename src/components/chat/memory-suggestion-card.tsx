"use client";

import { useState } from "react";
import { Database, Pencil, Save, X } from "lucide-react";

type MemorySuggestionState = {
  existingMemoryId?: string;
  mergeReason?: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  importance: number;
};

export function MemorySuggestionCard({
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
    <section className="rounded-xl border border-amber-200/80 bg-amber-50 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <Database size={17} strokeWidth={2} />
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
          className="inline-flex size-8 items-center justify-center rounded-lg text-stone-600 transition hover:bg-amber-100 hover:text-stone-900"
          onClick={onDismiss}
          type="button"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Title
          </span>
          <input
            className="h-10 rounded-xl border border-amber-200/80 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
            value={draft.title}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Category
            </span>
            <input
              className="h-10 rounded-xl border border-amber-200/80 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
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
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Importance
            </span>
            <input
              className="h-10 rounded-xl border border-amber-200/80 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
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
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Content
          </span>
          <textarea
            className="min-h-28 resize-y rounded-xl border border-amber-200/80 bg-white p-3 text-sm leading-6 text-stone-800 outline-none transition focus:border-amber-400"
            onChange={(event) =>
              setDraft((current) => ({ ...current, content: event.target.value }))
            }
            value={draft.content}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Tags
          </span>
          <input
            className="h-10 rounded-xl border border-amber-200/80 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
            onChange={(event) =>
              setDraft((current) => ({ ...current, tags: event.target.value }))
            }
            value={draft.tags}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-200/80 px-4 text-sm font-medium text-stone-600 hover:bg-amber-100 active:scale-[0.97]"
          onClick={onDismiss}
          type="button"
        >
          Dismiss
        </button>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-stone-300"
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
            <Pencil size={16} strokeWidth={2} />
          ) : (
            <Save size={16} strokeWidth={2} />
          )}
          {isSaving ? "Saving" : "Save"}
        </button>
      </div>
    </section>
  );
}
