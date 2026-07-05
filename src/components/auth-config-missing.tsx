export function AuthConfigMissing({ title }: { title: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-100 px-4 py-10">
      <section className="max-w-md rounded-md border border-stone-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-stone-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Clerk environment keys are not configured for this local environment.
        </p>
      </section>
    </main>
  );
}
