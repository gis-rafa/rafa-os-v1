import Link from "next/link";
import { Save, X } from "lucide-react";
import { saveMasterBrainAction } from "@/app/brain/actions";
import type { MasterBrainDocument } from "@/lib/master-brain";

export function BrainEditor({ document }: { document: MasterBrainDocument }) {
  return (
    <section className="mx-auto max-w-7xl overflow-hidden">
      <form action={saveMasterBrainAction}>
        <input name="documentTitle" type="hidden" value={document.title} />

        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600">
              Master Brain Editor
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950 sm:text-3xl">
              Edit MASTER-BRAIN.md
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              href="/brain"
            >
              <X size={16} strokeWidth={1.8} />
              Cancel
            </Link>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
              type="submit"
            >
              <Save size={16} strokeWidth={1.8} />
              Save
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {document.sections.map((section) => (
            <section
              className="rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
              key={section.title}
            >
              <input name="sectionTitle" type="hidden" value={section.title} />
              <label
                className="mb-3 block text-base font-semibold text-stone-950"
                htmlFor={`section-${section.title}`}
              >
                {section.title}
              </label>
              <textarea
                className="min-h-36 w-full resize-y rounded-md border border-stone-200 bg-stone-50 p-3 font-mono text-sm leading-6 text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white sm:p-4"
                defaultValue={section.content}
                id={`section-${section.title}`}
                name="sectionContent"
                spellCheck={false}
              />
            </section>
          ))}
        </div>
      </form>
    </section>
  );
}
