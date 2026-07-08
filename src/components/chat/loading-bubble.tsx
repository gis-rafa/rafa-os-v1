"use client";

import { Avatar } from "./avatar";

export function LoadingBubble() {
  return (
    <article className="flex justify-start gap-3">
      <Avatar label="AI" />
      <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 px-4 py-4">
        <div className="flex gap-1.5">
          <span className="size-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.2s]" />
          <span className="size-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.1s]" />
          <span className="size-2 animate-bounce rounded-full bg-stone-400" />
        </div>
      </div>
    </article>
  );
}
