import { Inbox, Save, Trash2 } from "lucide-react";
import {
  saveInboxEntryAction,
  deleteInboxEntryAction,
  getInboxEntriesAction
} from "@/app/inbox/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbox | RAFA OS",
  description: "Quick capture for thoughts, ideas, and notes."
};

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const entries = await getInboxEntriesAction();

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600">
            Quick Capture
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-950">Inbox</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            Dump thoughts, ideas, problems, or goals here as timestamped
            Markdown notes.
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-950 text-white">
          <Inbox size={22} strokeWidth={1.8} />
        </div>
      </div>

      <form
        action={saveInboxEntryAction}
        className="mb-8 rounded-md border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700">
            <Inbox size={19} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-950">
              New Inbox Note
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Saved to memory/inbox as Markdown.
            </p>
          </div>
        </div>

        <label className="sr-only" htmlFor="entry">
          Inbox entry
        </label>
        <textarea
          className="min-h-56 w-full resize-y rounded-md border border-stone-200 bg-stone-50 p-4 text-base leading-7 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
          id="entry"
          name="entry"
          placeholder="Write anything you need to capture..."
          required
        />

        <div className="mt-4 flex justify-end">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
            type="submit"
          >
            <Save size={16} strokeWidth={1.8} />
            Save Note
          </button>
        </div>
      </form>

      {entries.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-stone-600">
            {entries.length} saved note{entries.length !== 1 ? "s" : ""}
          </p>
          {entries.map((entry) => (
            <article
              className="rounded-md border border-stone-200 bg-white p-5 shadow-sm"
              key={entry.fileName}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-stone-600">
                    {formatTimestamp(entry.timestamp)}
                  </p>
                  <div className="prose prose-sm mt-3 max-w-none text-stone-700">
                    {renderEntryContent(entry.content)}
                  </div>
                </div>
                <form action={deleteInboxEntryAction}>
                  <input
                    name="fileName"
                    type="hidden"
                    value={entry.fileName}
                  />
                  <button
                    aria-label="Delete entry"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-stone-200 text-red-600 transition hover:bg-red-50"
                    type="submit"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-stone-700">
            No inbox notes yet.
          </p>
          <p className="mt-2 text-sm text-stone-600">
            Capture your first thought above.
          </p>
        </div>
      )}
    </section>
  );
}

function formatTimestamp(isoString: string) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return isoString;
  }
}

function renderEntryContent(content: string) {
  const body = content.replace(/^# Inbox Note\n\n## Timestamp\n.*\n\n## Entry\n/, "");
  const lines = body.split("\n").filter(Boolean);
  return (
    <div>
      {lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}
