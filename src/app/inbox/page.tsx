import { Inbox, Save } from "lucide-react";
import { saveInboxEntryAction } from "@/app/inbox/actions";

export const dynamic = "force-dynamic";

export default function InboxPage() {
  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">
          Quick Capture
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-stone-950">Inbox</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
          Dump thoughts, ideas, problems, or goals here as timestamped Markdown
          notes.
        </p>
      </div>

      <form
        action={saveInboxEntryAction}
        className="rounded-md border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700">
            <Inbox size={19} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-950">
              New Inbox Note
            </h3>
            <p className="mt-1 text-sm text-stone-500">
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
    </section>
  );
}

