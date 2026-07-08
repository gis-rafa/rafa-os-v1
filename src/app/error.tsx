"use client";

export default function RootError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h2 className="text-lg font-semibold text-stone-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          {error.message ?? "An unexpected error occurred."}
        </p>
        <button
          className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-stone-800 active:scale-[0.97]"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}