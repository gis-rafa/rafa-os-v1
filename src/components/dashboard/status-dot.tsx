"use client";

export function StatusDot({ status }: { status: string }) {
  const className =
    status === "Done"
      ? "bg-emerald-500"
      : status === "In Progress"
        ? "bg-amber-500"
        : "bg-stone-400";

  return <span aria-label={`Status: ${status}`} className={`size-2.5 rounded-full ${className}`} role="status" />;
}
