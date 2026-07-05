import { getKnowledgeLibraryWithContent } from "@/lib/knowledge";

export default async function KnowledgePage() {
  const knowledge = await getKnowledgeLibraryWithContent();

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6">
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
