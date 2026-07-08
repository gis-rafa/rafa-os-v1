import Link from "next/link";

type PaginationControlsProps = {
  basePath: string;
  page: number;
  searchParams: Record<string, string>;
  total: number;
  limit: number;
};

export function PaginationControls({
  basePath,
  page,
  searchParams,
  total,
  limit
}: PaginationControlsProps) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  function buildHref(newPage: number) {
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4"
    >
      <p className="text-sm text-stone-600">
        Page {page} of {totalPages} ({total} items)
      </p>
      <div className="flex gap-2">
        {prevPage ? (
          <Link
            className="inline-flex h-9 items-center justify-center rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-600 hover:bg-stone-100"
            href={buildHref(prevPage)}
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex h-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-400">
            Previous
          </span>
        )}
        {nextPage ? (
          <Link
            className="inline-flex h-9 items-center justify-center rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-600 hover:bg-stone-100"
            href={buildHref(nextPage)}
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex h-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-400">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
