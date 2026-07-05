"use client";

export function Avatar({ label }: { label: string }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-stone-900 text-xs font-semibold text-white">
      {label}
    </div>
  );
}
