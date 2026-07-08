"use client";

import { Code2 } from "lucide-react";

export function DeveloperPanel({ content }: { content: string }) {
  return (
    <aside className="flex min-h-80 max-h-[55dvh] flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-stone-950 text-white shadow-sm xl:max-h-none">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
          <Code2 size={18} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Developer Panel</h3>
          <p className="mt-1 text-xs text-stone-400">
            Context routing and prompt preview
          </p>
        </div>
      </div>
      <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-5 text-stone-200">
        {content}
      </pre>
    </aside>
  );
}
