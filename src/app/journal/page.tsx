import Link from "next/link";
import { NotebookPen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  createJournalEntryAction,
  deleteJournalEntryAction,
  updateJournalEntryAction
} from "@/app/journal/actions";
import type { JournalEntry } from "@/db";
import { requireCurrentDbUser } from "@/lib/auth-user";
import {
  getJournalEntryForUser,
  listJournalEntries
} from "@/lib/journal";
import { PageHeader, EmptyState } from "@/components/ui";
import type { Metadata } from "next";
import { PaginationControls } from "@/components/pagination";

export const metadata: Metadata = {
  title: "Journal | RAFA OS",
  description: "Daily journal entries with mood tracking and tags."
};

export const dynamic = "force-dynamic";

type JournalPageProps = {
  searchParams: Promise<{
    q?: string;
    edit?: string;
    page?: string;
  }>;
};

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = await searchParams;
  const user = await requireCurrentDbUser();

  const search = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = 50;
  const offset = (page - 1) * limit;
  const [journalResult, editingEntry] = await Promise.all([
    listJournalEntries({ userId: user.id, search, limit, offset }),
    params.edit ? getJournalEntryForUser(params.edit, user.id) : null
  ]);

  const { items: journalList, total } = journalResult;

  return (
    <JournalShell
      editingEntry={editingEntry}
      isDatabaseConfigured
      journalList={journalList}
      page={page}
      searchParams={{ search }}
      total={total}
    />
  );
}

function JournalShell({
  editingEntry,
  isDatabaseConfigured,
  journalList,
  page,
  searchParams,
  total
}: {
  editingEntry: JournalEntry | null;
  isDatabaseConfigured: boolean;
  journalList: JournalEntry[];
  page: number;
  searchParams: {
    search: string;
  };
  total: number;
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0">
        <PageHeader
          icon={<NotebookPen size={22} strokeWidth={2} />}
          title="Journal"
          description={isDatabaseConfigured ? "Write and reflect on your daily experiences." : "Configure PostgreSQL to start journaling."}
        />

        <form
          className="mb-5 grid gap-3 rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]"
          method="get"
        >
          <label className="relative block">
            <span className="sr-only">Search journal entries</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              size={17}
              strokeWidth={2}
            />
            <input
              className="h-11 w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
              defaultValue={searchParams.search}
              name="q"
              placeholder="Search title or content"
            />
          </label>
          <button
            className="inline-flex h-11 items-center justify-center rounded-lg bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-stone-800"
            type="submit"
          >
            Search
          </button>
        </form>

        <div className="grid gap-3">
          {journalList.length === 0 ? (
            <EmptyState
              title="No journal entries yet."
              description="Write your first entry using the form on the right."
            />
          ) : (
            journalList.map((entry) => (
              <article
                className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm"
                key={entry.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-stone-600">
                        {formatDate(entry.createdAt)}
                      </span>
                      {entry.mood ? (
                        <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                          Mood: {entry.mood}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-semibold text-stone-950">
                      {entry.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-600 line-clamp-3">
                      {entry.content}
                    </p>
                    {entry.tags.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            className="rounded-md border border-stone-200 px-2 py-1 text-xs text-stone-600"
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      aria-label={`Edit ${entry.title}`}
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:bg-stone-50"
                      href={`/journal?edit=${entry.id}`}
                    >
                      <Pencil size={16} strokeWidth={2} />
                    </Link>
                    <form action={deleteJournalEntryAction}>
                      <input name="id" type="hidden" value={entry.id} />
                      <button
                        aria-label={`Delete ${entry.title}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-200 text-red-600 transition hover:bg-red-50"
                        type="submit"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <PaginationControls
          basePath="/journal"
          page={page}
          searchParams={searchParams}
          total={total}
          limit={50}
        />
      </div>

      <JournalForm
        editingEntry={editingEntry}
        isDatabaseConfigured={isDatabaseConfigured}
      />
    </section>
  );
}

function JournalForm({
  editingEntry,
  isDatabaseConfigured
}: {
  editingEntry: JournalEntry | null;
  isDatabaseConfigured: boolean;
}) {
  const action = editingEntry ? updateJournalEntryAction : createJournalEntryAction;

  return (
    <aside className="h-fit rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
          <Plus size={18} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950">
            {editingEntry ? "Edit Entry" : "New Entry"}
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            Saved to PostgreSQL for this account.
          </p>
        </div>
      </div>

      <form action={action} className="grid gap-4">
        {editingEntry ? (
          <input name="id" type="hidden" value={editingEntry.id} />
        ) : null}
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">Title</span>
          <input
            className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            defaultValue={editingEntry?.title ?? ""}
            disabled={!isDatabaseConfigured}
            name="title"
            placeholder="What is this entry about?"
            required
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">Content</span>
          <textarea
            className="min-h-56 resize-y rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            defaultValue={editingEntry?.content ?? ""}
            disabled={!isDatabaseConfigured}
            name="content"
            placeholder="Write your thoughts..."
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Mood</span>
            <input
              className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
              defaultValue={editingEntry?.mood ?? ""}
              disabled={!isDatabaseConfigured}
              name="mood"
              placeholder="calm, focused, tired..."
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Tags</span>
            <input
              className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
              defaultValue={editingEntry?.tags.join(", ") ?? ""}
              disabled={!isDatabaseConfigured}
              name="tags"
              placeholder="comma, separated"
            />
          </label>
        </div>
        <div className="flex items-center justify-between gap-3">
          {editingEntry ? (
            <Link
              className="text-sm font-medium text-stone-600 transition hover:text-stone-950"
              href="/journal"
            >
              Cancel
            </Link>
          ) : (
            <span />
          )}
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800"
            disabled={!isDatabaseConfigured}
            type="submit"
          >
            {editingEntry ? "Save Changes" : "Create Entry"}
          </button>
        </div>
      </form>
    </aside>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}