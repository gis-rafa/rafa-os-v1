import {
  Brain,
  Compass,
  Crosshair,
  Fingerprint,
  ListChecks,
  Pencil
} from "lucide-react";
import Link from "next/link";
import type { MasterBrainSection } from "@/lib/master-brain";

const sectionStyles = {
  Identity: {
    icon: Fingerprint,
    className: "lg:col-span-7"
  },
  Mission: {
    icon: Compass,
    className: "lg:col-span-5"
  },
  "Decision Rules": {
    icon: ListChecks,
    className: "lg:col-span-6"
  },
  "Current Focus": {
    icon: Crosshair,
    className: "lg:col-span-3"
  },
  "Active Context": {
    icon: Brain,
    className: "lg:col-span-3"
  }
};

export function BrainPageView({ sections }: { sections: MasterBrainSection[] }) {
  return (
    <section className="mx-auto max-w-7xl overflow-hidden">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Master Brain
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950 sm:text-3xl">
            Core Operating Context
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-sm text-stone-600 sm:block">
            Loaded from MASTER-BRAIN.md
          </p>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 active:scale-[0.97]"
            href="/brain?mode=edit"
          >
            <Pencil size={16} strokeWidth={2} />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {sections.map((section, index) => {
          const style = sectionStyles[section.title as keyof typeof sectionStyles];
          const Icon = style.icon;

          return (
            <article
              className={`animate-slide-up rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm hover:shadow-md sm:p-6 ${style.className}`}
              key={section.title}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-stone-50/60 text-stone-700">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-stone-950">
                  {section.title}
                </h3>
              </div>
              <MarkdownSection content={section.content} />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MarkdownSection({ content }: { content: string }) {
  const lines = content.split(/\n+/).filter(Boolean);
  const orderedItems = lines
    .map((line) => line.match(/^\d+\.\s+(.+)$/)?.[1])
    .filter((line): line is string => Boolean(line));

  if (content.trim() === "TODO") {
    return (
      <div className="rounded-xl border border-dashed border-stone-300/80 bg-stone-50/60 p-4 text-sm text-stone-600">
        TODO
      </div>
    );
  }

  if (orderedItems.length === lines.length) {
    return (
      <ol className="space-y-2">
        {orderedItems.map((item, index) => (
          <li
            className="flex min-w-0 gap-3 text-sm leading-6 text-stone-700"
            key={item}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-xs font-semibold text-white">
              {index + 1}
            </span>
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="space-y-4">
      {lines.map((line) => (
        <p className="text-sm leading-7 text-stone-700" key={line}>
          {line}
        </p>
      ))}
    </div>
  );
}
