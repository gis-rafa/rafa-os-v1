import Link from "next/link";
import { Home } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600">
        404
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-stone-950">
        Project not found
      </h2>
      <p className="mt-3 text-base leading-7 text-stone-600">
        The project you are looking for does not exist or has been removed.
      </p>
      <Link
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
        href="/projects"
      >
        <Home size={16} strokeWidth={1.8} />
        Back to projects
      </Link>
    </section>
  );
}
