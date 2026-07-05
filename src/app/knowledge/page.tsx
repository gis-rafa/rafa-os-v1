import { getKnowledgeLibraryWithContent } from "@/lib/knowledge";
import { Plus, X } from "lucide-react";
import { createKnowledgeFileAction } from "@/app/knowledge/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge | RAFA OS",
  description: "Imported knowledge library with tags and content."
};

export default async function KnowledgePage() {
  const knowledge = await getKnowledgeLibraryWithContent();

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">
            Knowledge System
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-950">
            Imported Knowledge
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-stone-600">
            Canonical source: {knowledge.canonicalSource}
          </p>
        </div>
      </div>

      <details className="mb-8 rounded-md border border-stone-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-50">
          <Plus size={16} strokeWidth={1.8} />
          Add knowledge file
        </summary>
        <form action={createKnowledgeFileAction} className="border-t border-stone-200 p-5">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="title">
              Title
            </label>
            <input
              className="block w-full rounded-md border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-950 placeholder-stone-400 outline-none transition focus:border-stone-400"
              id="title"
              name="title"
              placeholder="File title"
              required
              type="text"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="tags">
              Tags (comma-separated)
            </label>
            <input
              className="block w-full rounded-md border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-950 placeholder-stone-400 outline-none transition focus:border-stone-400"
              id="tags"
              name="tags"
              placeholder="e.g. GIS, Portfolio, Career"
              type="text"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="content">
              Content
            </label>
            <textarea
              className="block w-full rounded-md border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-950 placeholder-stone-400 outline-none transition focus:border-stone-400"
              id="content"
              name="content"
              placeholder="Markdown content..."
              required
              rows={8}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              type="reset"
            >
              <X size={16} strokeWidth={1.8} />
              Clear
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
              type="submit"
            >
              <Plus size={16} strokeWidth={1.8} />
              Create
            </button>
          </div>
        </form>
      </details>

      <div className="mb-6 flex flex-wrap gap-2">
        {knowledge.tags.map((tag) => (
          <a
            className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
            href={`#${tag.toLowerCase()}`}
            key={tag}
          >
            {tag}
          </a>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Knowledge files</p>
          <p className="mt-2 text-3xl font-semibold text-stone-950">
            {knowledge.files.length}
          </p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Tags</p>
          <p className="mt-2 text-3xl font-semibold text-stone-950">
            {knowledge.tags.length}
          </p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-4 md:col-span-2">
          <p className="text-sm text-stone-500">Duplicate handling</p>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            {knowledge.duplicateSections[0]?.handling}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {knowledge.tags.map((tag) => (
          <section id={tag.toLowerCase()} key={tag}>
            <div className="mb-3 flex items-end justify-between gap-3">
              <h3 className="text-xl font-semibold text-stone-950">{tag}</h3>
              <p className="text-sm text-stone-500">
                {knowledge.filesByTag[tag]?.length ?? 0} files
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {knowledge.filesByTag[tag]?.map((file) => (
                <a
                  className="rounded-md border border-stone-200 bg-white p-4 transition hover:border-stone-400"
                  href={`#file-${slugId(file.file)}`}
                  key={`${tag}-${file.file}`}
                >
                  <p className="text-sm font-semibold text-stone-950">
                    {file.title}
                  </p>
                  <p className="mt-2 break-all text-xs leading-5 text-stone-500">
                    {file.file}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        <h3 className="text-xl font-semibold text-stone-950">
          Canonical Files
        </h3>
        {knowledge.files.map((file) => (
          <details
            className="rounded-md border border-stone-200 bg-white p-4"
            id={`file-${slugId(file.file)}`}
            key={file.file}
          >
            <summary className="cursor-pointer text-sm font-semibold text-stone-950">
              {file.title}
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {file.tags.map((tag) => (
                <span
                  className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-3 break-all text-xs text-stone-500">
              {file.file}
            </p>
            <pre className="mt-4 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-md bg-stone-950 p-4 text-sm leading-6 text-stone-100">
              {file.content}
            </pre>
          </details>
        ))}
      </div>
    </section>
  );
}

function slugId(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}
