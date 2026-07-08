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
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Master Brain Editor
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950 sm:text-3xl">
              Edit MASTER-BRAIN.md
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 text-sm font-medium text-stone-600 hover:bg-stone-50 active:scale-[0.97]"
              href="/brain"
            >
              <X size={16} strokeWidth={2} />
              Cancel
            </Link>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 active:scale-[0.97]"
              type="submit"
            >
              <Save size={16} strokeWidth={2} />
              Save
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {document.sections.map((section) => (
            <section
              className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm hover:shadow-md sm:p-6"
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
                className="min-h-36 w-full resize-y rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 font-mono text-sm leading-6 text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white sm:p-4"
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
