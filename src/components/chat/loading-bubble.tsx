"use client";

import { Avatar } from "./avatar";

export function LoadingBubble() {
  return (
    <article className="flex justify-start gap-3">
      <Avatar label="AI" />
      <div className="rounded-md border border-stone-200 bg-stone-50 px-4 py-4">
        <div className="flex gap-1.5">
          <span className="size-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.2s]" />
          <span className="size-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.1s]" />
          <span className="size-2 animate-bounce rounded-full bg-stone-400" />
        </div>
      </div>
    </article>
  );
}
