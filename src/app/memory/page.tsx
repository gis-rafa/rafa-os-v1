import Link from "next/link";
import { Database, Filter, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  createMemoryAction,
  deleteMemoryAction,
  updateMemoryAction
} from "@/app/memory/actions";
import { requireCurrentDbUser } from "@/lib/auth-user";
import {
  getMemoryForUser,
  listMemories,
  listMemoryCategories
} from "@/lib/memories";
import type { Memory } from "@/db";
import { PageHeader, EmptyState } from "@/components/ui";
import type { Metadata } from "next";
import { PaginationControls } from "@/components/pagination";

export const metadata: Metadata = {
  title: "Memory | RAFA OS",
  description: "Structured memory with categories, tags, and search."
};

export const dynamic = "force-dynamic";

type MemoryPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    edit?: string;
    page?: string;
  }>;
};

export default async function MemoryPage({ searchParams }: MemoryPageProps) {
  const params = await searchParams;
  const user = await requireCurrentDbUser();

  const search = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = 50;
  const offset = (page - 1) * limit;
  const [memoryResult, categories, editingMemory] = await Promise.all([
    listMemories({ userId: user.id, search, category, limit, offset }),
    listMemoryCategories(user.id),
    params.edit ? getMemoryForUser(params.edit, user.id) : null
  ]);

  const { items: memoryList, total } = memoryResult;

  return (
    <MemoryShell
      categories={categories}
      editingMemory={editingMemory}
      memoryList={memoryList}
      page={page}
      searchParams={{ category, search }}
      total={total}
    />
  );
}

function MemoryShell({
  categories,
  editingMemory,
  memoryList,
  page,
  searchParams,
  total
}: {
  categories: string[];
  editingMemory: Memory | null;
  memoryList: Memory[];
  page: number;
  searchParams: {
    category: string;
    search: string;
  };
  total: number;
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0">
        <PageHeader
          icon={<Database size={22} strokeWidth={2} />}
          title="Memory Engine"
          description="Store durable context as private PostgreSQL records tied to your workspace."
        />

        <form
          className="mb-5 grid gap-3 rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]"
          method="get"
        >
          <label className="relative block">
            <span className="sr-only">Search memories</span>
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
          <label className="relative block">
            <span className="sr-only">Filter by category</span>
            <Filter
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              size={17}
              strokeWidth={2}
            />
            <select
              className="h-11 w-full appearance-none rounded-lg border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
              defaultValue={searchParams.category}
              name="category"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button
            className="inline-flex h-11 items-center justify-center rounded-lg bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-stone-800"
            type="submit"
          >
            Apply
          </button>
        </form>

        <div className="grid gap-3">
          {memoryList.length === 0 ? (
            <EmptyState
              title="No memories found."
              description="Create the first memory from the panel on the right."
            />
          ) : (
            memoryList.map((memory) => (
              <article
                className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm"
                key={memory.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                        {memory.category}
                      </span>
                      <span className="text-xs text-stone-600">
                        Importance {memory.importance}/5
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-950">
                      {memory.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">
                      {memory.content}
                    </p>
                    {memory.tags.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {memory.tags.map((tag) => (
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
                      aria-label={`Edit ${memory.title}`}
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:bg-stone-50"
                      href={`/memory?edit=${memory.id}`}
                    >
                      <Pencil size={16} strokeWidth={2} />
                    </Link>
                    <form action={deleteMemoryAction}>
                      <input name="id" type="hidden" value={memory.id} />
                      <button
                        aria-label={`Delete ${memory.title}`}
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
          basePath="/memory"
          page={page}
          searchParams={searchParams}
          total={total}
          limit={50}
        />
      </div>

      <MemoryForm editingMemory={editingMemory} />
    </section>
  );
}

function MemoryForm({ editingMemory }: { editingMemory: Memory | null }) {
  const action = editingMemory ? updateMemoryAction : createMemoryAction;

  return (
    <aside className="h-fit rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
          <Plus size={18} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950">
            {editingMemory ? "Edit Memory" : "Create Memory"}
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            Saved to local workspace database.
          </p>
        </div>
      </div>

      <form action={action} className="grid gap-4">
        {editingMemory ? (
          <input name="id" type="hidden" value={editingMemory.id} />
        ) : null}
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">Category</span>
          <input
            className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            defaultValue={editingMemory?.category ?? ""}
            name="category"
            placeholder="Health, Career, Relationship..."
            required
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">Title</span>
          <input
            className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            defaultValue={editingMemory?.title ?? ""}
            name="title"
            placeholder="Short memory title"
            required
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">Content</span>
          <textarea
            className="min-h-40 resize-y rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            defaultValue={editingMemory?.content ?? ""}
            name="content"
            placeholder="What should RAFA OS remember?"
            required
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">Tags</span>
          <input
            className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            defaultValue={editingMemory?.tags.join(", ") ?? ""}
            name="tags"
            placeholder="comma, separated, tags"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">
            Importance
          </span>
          <input
            className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            defaultValue={editingMemory?.importance ?? 3}
            max={5}
            min={1}
            name="importance"
            type="number"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          {editingMemory ? (
            <Link
              className="text-sm font-medium text-stone-600 transition hover:text-stone-950"
              href="/memory"
            >
              Cancel
            </Link>
          ) : (
            <span />
          )}
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800"
            type="submit"
          >
            {editingMemory ? "Save Changes" : "Create Memory"}
          </button>
        </div>
      </form>
    </aside>
  );
}