type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">
          Placeholder
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-stone-950">{title}</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
          {description}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-36 rounded-md border border-stone-200 bg-white" />
        <div className="h-36 rounded-md border border-stone-200 bg-white" />
        <div className="h-36 rounded-md border border-stone-200 bg-white" />
      </div>
      <div className="mt-4 h-72 rounded-md border border-stone-200 bg-white" />
    </section>
  );
}

