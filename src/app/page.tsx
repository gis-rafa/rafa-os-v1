import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  Brain,
  LockKeyhole,
  LayoutDashboard,
  MessageCircle,
  Database,
  FolderKanban,
  BookOpen,
  NotebookPen,
  Search
} from "lucide-react";
import { isClerkConfigured } from "@/lib/clerk-config";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Morning brief, mission score, and daily task execution"
  },
  {
    icon: Brain,
    title: "Master Brain",
    description: "Identity, mission rules, and active context for AI alignment"
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    description: "Chat with Rafa, powered by contextual memory and knowledge"
  },
  {
    icon: Database,
    title: "Memory System",
    description: "Structured memory with categories, tags, and relevance scoring"
  },
  {
    icon: FolderKanban,
    title: "Projects & Tasks",
    description: "Track project progress and execution tasks with status"
  },
  {
    icon: BookOpen,
    title: "Knowledge Library",
    description: "Ingested knowledge files with duplicate detection and tags"
  },
  {
    icon: NotebookPen,
    title: "Journal",
    description: "Daily journal entries with mood tracking and tags"
  },
  {
    icon: Search,
    title: "Global Search",
    description: "Search across memories, journal entries, and knowledge"
  }
];

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

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                className="rounded-md border border-white/10 p-5 transition hover:border-white/20"
                key={feature.title}
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-white/10 text-white">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
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
