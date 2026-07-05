import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Brain, LockKeyhole } from "lucide-react";
import { isClerkConfigured } from "@/lib/clerk-config";

export default async function LandingPage() {
  const hasClerk = isClerkConfigured();
  const { userId } = hasClerk ? await auth() : { userId: null };

  return (
    <main className="min-h-dvh bg-stone-950 text-white">
      <section className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-5 py-16 sm:px-8">
        <div className="max-w-2xl">
          <div className="mb-8 flex size-12 items-center justify-center rounded-md bg-white text-stone-950">
            <Brain size={24} strokeWidth={1.8} />
          </div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-stone-400">
            RAFA OS
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-6xl">
            Personal operating system for focused execution.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-stone-300 sm:text-lg">
            A private workspace for Rafa&apos;s brain, projects, knowledge,
            morning brief, and AI-guided execution.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {userId || !hasClerk ? (
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
                href="/dashboard"
              >
                {hasClerk ? "Open dashboard" : "Open local dashboard"}
                <ArrowRight size={17} strokeWidth={1.8} />
              </Link>
            ) : (
              <>
                <Link
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
                  href="/sign-in"
                >
                  Sign in
                  <ArrowRight size={17} strokeWidth={1.8} />
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                  href="/sign-up"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="mt-14 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-stone-400">
          <LockKeyhole size={17} strokeWidth={1.8} />
          {hasClerk
            ? "Protected with Clerk authentication."
            : "Local auth is disabled until Clerk environment keys are configured."}
        </div>
      </section>
    </main>
  );
}
