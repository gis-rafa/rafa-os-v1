export default function RootLoading() {
  return (
    <section className="mx-auto max-w-5xl animate-pulse">
      <div className="mb-6">
        <div className="mb-2 h-4 w-24 rounded bg-stone-200" />
        <div className="mb-3 h-8 w-56 rounded bg-stone-200" />
        <div className="h-5 w-96 rounded bg-stone-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            className="h-28 rounded-md border border-stone-200 bg-white p-5"
            key={i}
          >
            <div className="mb-3 h-4 w-20 rounded bg-stone-200" />
            <div className="h-6 w-16 rounded bg-stone-200" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            className="h-64 rounded-md border border-stone-200 bg-white p-5"
            key={i}
          >
            <div className="mb-4 h-5 w-40 rounded bg-stone-200" />
            {[...Array(4)].map((__, j) => (
              <div className="mb-3 flex items-center gap-3" key={j}>
                <div className="h-3 flex-1 rounded bg-stone-200" />
                <div className="h-3 w-8 rounded bg-stone-200" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
