import { Search, FileText, Brain, BookOpen, Sparkles, AlignLeft } from "lucide-react";
import { globalSearchAction, semanticSearchAction } from "@/app/search/actions";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | RAFA OS",
  description: "Search across memories, journal entries, and knowledge."
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; mode?: string }>;
}) {
  const { q, mode } = await searchParams;
  const query = q ?? "";
  const isSemantic = mode === "semantic";
  const results = query
    ? isSemantic
      ? await semanticSearchAction(query)
      : await globalSearchAction(query)
    : [];

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600">
            Search
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-950">
            Global Search
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            {isSemantic
              ? "Semantic search finds conceptually related results using vector embeddings."
              : "Search across memories, journal entries, and knowledge files."}
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-950 text-white">
          <Search size={22} strokeWidth={1.8} />
        </div>
      </div>

      <form className="mb-8" method="get">
        <div className="flex gap-3">
          <input
            className="block w-full rounded-md border border-stone-200 bg-white px-4 py-3 text-base text-stone-950 placeholder-stone-400 shadow-sm outline-none transition focus:border-stone-400"
            defaultValue={query}
            name="q"
            placeholder="Search memories, journal entries, knowledge..."
            type="search"
          />
          <input name="mode" type="hidden" value={isSemantic ? "semantic" : "keyword"} />
          <button
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-stone-950 px-5 text-sm font-medium text-white transition hover:bg-stone-800"
            type="submit"
          >
            <Search size={16} strokeWidth={1.8} />
            Search
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <ModeToggle current={isSemantic ? "semantic" : "keyword"} query={query} />
        </div>
      </form>

      {query && results.length === 0 ? (
        <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-stone-700">
            No results found for &ldquo;{query}&rdquo;.
          </p>
          <p className="mt-2 text-sm text-stone-600">
            {isSemantic
              ? "Try keyword search instead, or ensure embeddings have been generated."
              : "Try different keywords or browse from the sidebar."}
          </p>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-sm text-stone-600">
            {results.length} result{results.length !== 1 ? "s" : ""} for
            &ldquo;{query}&rdquo;
            {isSemantic ? " (semantic)" : ""}
          </p>
          {results.map((result, i) => (
            <ResultCard
              key={`${result.type}-${result.id}-${i}`}
              result={result}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ModeToggle({
  current,
  query
}: {
  current: "keyword" | "semantic";
  query: string;
}) {
  return (
    <div className="inline-flex rounded-md border border-stone-200 bg-white p-0.5">
      <Link
        className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
          current === "keyword"
            ? "bg-stone-950 text-white"
            : "text-stone-600 hover:text-stone-950"
        }`}
        href={`/search?q=${encodeURIComponent(query)}&mode=keyword`}
      >
        <AlignLeft size={13} strokeWidth={1.8} />
        Keyword
      </Link>
      <Link
        className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
          current === "semantic"
            ? "bg-stone-950 text-white"
            : "text-stone-600 hover:text-stone-950"
        }`}
        href={`/search?q=${encodeURIComponent(query)}&mode=semantic`}
      >
        <Sparkles size={13} strokeWidth={1.8} />
        Semantic
      </Link>
    </div>
  );
}

function ResultCard({
  result
}: {
  result: Awaited<ReturnType<typeof globalSearchAction>>[number];
}) {
  const icons = {
    memory: Brain,
    journal: BookOpen,
    knowledge: FileText
  };
  const Icon = icons[result.type];

  const labels: Record<string, string> = {
    memory: "Memory",
    journal: "Journal",
    knowledge: "Knowledge"
  };

  return (
    <Link href={result.url}>
      <article className="rounded-md border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-600">
            <Icon size={18} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                {labels[result.type]}
              </span>
            </div>
            <h3 className="text-base font-semibold text-stone-950">
              {result.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              {result.excerpt || result.title}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
