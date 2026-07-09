import { BookOpen, Plus, X } from "lucide-react";
import { getKnowledgeLibraryWithContent } from "@/lib/knowledge";
import { createKnowledgeFileAction } from "@/app/knowledge/actions";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { PageHeader, Card } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge | RAFA OS",
  description: "Imported knowledge library with tags and content."
};

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const user = await requireCurrentDbUser();
  const knowledge = await getKnowledgeLibraryWithContent(user.id);

  return (
    <section className="mx-auto max-w-6xl">
      <PageHeader
        icon={<BookOpen size={22} strokeWidth={2} />}
        title="Knowledge System"
        description={`Canonical source: ${knowledge.canonicalSource}`}
      />

      <Card className="mb-8" hover={false}>
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-950 transition">
            <Plus size={16} strokeWidth={2} />
            Add knowledge file
          </summary>
          <form action={createKnowledgeFileAction} className="mt-5 border-t border-stone-200/80 pt-5">
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="title">
                Title
              </label>
              <input
                className="block w-full h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
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
                className="block w-full h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
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
                className="block w-full rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
                id="content"
                name="content"
                placeholder="Markdown content..."
                required
                rows={8}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                type="reset"
              >
                <X size={16} strokeWidth={2} />
                Clear
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800"
                type="submit"
              >
                <Plus size={16} strokeWidth={2} />
                Create
              </button>
            </div>
          </form>
        </details>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        {knowledge.tags.map((tag) => (
          <a
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
            href={`#${tag.toLowerCase()}`}
            key={tag}
          >
            {tag}
          </a>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card hover={false}>
          <p className="text-sm text-stone-600">Knowledge files</p>
          <p className="mt-2 text-3xl font-semibold text-stone-950">
            {knowledge.files.length}
          </p>
        </Card>
        <Card hover={false}>
          <p className="text-sm text-stone-600">Tags</p>
          <p className="mt-2 text-3xl font-semibold text-stone-950">
            {knowledge.tags.length}
          </p>
        </Card>
        <Card className="md:col-span-2" hover={false}>
          <p className="text-sm text-stone-600">Duplicate handling</p>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            {knowledge.duplicateSections[0]?.handling}
          </p>
        </Card>
      </div>

      <div className="mt-8 space-y-8">
        {knowledge.tags.map((tag) => (
          <section id={tag.toLowerCase()} key={tag}>
            <div className="mb-3 flex items-end justify-between gap-3">
              <h3 className="text-xl font-semibold text-stone-950">{tag}</h3>
              <p className="text-sm text-stone-600">
                {knowledge.filesByTag[tag]?.length ?? 0} files
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {knowledge.filesByTag[tag]?.map((file) => (
                <a
                  className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm transition hover:shadow-md"
                  href={`#file-${slugId(file.file)}`}
                  key={`${tag}-${file.file}`}
                >
                  <p className="text-sm font-semibold text-stone-950">
                    {file.title}
                  </p>
                  <p className="mt-2 break-all text-xs leading-5 text-stone-600">
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
          <Card key={file.file} id={`file-${slugId(file.file)}`} hover={false}>
          <details className="group">
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
            <p className="mt-3 break-all text-xs text-stone-600">
              {file.file}
            </p>
            <pre className="mt-4 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-lg bg-stone-950 p-4 text-sm leading-6 text-stone-100">
              {file.content}
            </pre>
          </details>
        </Card>
        ))}
      </div>
    </section>
  );
}

function slugId(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}