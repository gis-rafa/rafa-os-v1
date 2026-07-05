import {
  BarChart3,
  Brain,
  BookOpen,
  ListChecks,
  FolderKanban,
  Flag
} from "lucide-react";
import { getReportDataAction } from "@/app/reports/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports | RAFA OS",
  description: "Analytics and data summaries across the system."
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const data = await getReportDataAction();

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600">
            Analytics
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-950">
            Reports & Analytics
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            Overview of your data across the system.
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-950 text-white">
          <BarChart3 size={22} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Brain}
          label="Memories"
          value={String(data.memoryStats.total)}
        />
        <StatCard
          icon={BookOpen}
          label="Journal entries"
          value={String(data.journalStats.total)}
        />
        <StatCard
          icon={ListChecks}
          label="Tasks"
          value={`${data.taskStats.completed}/${data.taskStats.total}`}
          subtext={`${data.taskStats.rate}% complete`}
        />
        <StatCard
          icon={Flag}
          label="Priorities"
          value={`${data.priorityStats.completed}/${data.priorityStats.total}`}
          subtext={`${data.priorityStats.rate}% complete`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-950">
            <Brain size={18} strokeWidth={1.8} />
            Memories by Category
          </h3>
          {data.memoryStats.byCategory.length === 0 ? (
            <p className="text-sm text-stone-600">No memories yet.</p>
          ) : (
            <div className="space-y-3">
              {data.memoryStats.byCategory.map((cat) => (
                <div key={cat.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-stone-700">
                      {cat.category}
                    </span>
                    <span className="text-stone-600">{cat.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100">
                    <div
                      className="h-2 rounded-full bg-stone-950 transition-all"
                      style={{
                        width: `${(cat.count / Math.max(...data.memoryStats.byCategory.map((c) => c.count))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-950">
            <FolderKanban size={18} strokeWidth={1.8} />
            Projects by Status
          </h3>
          {data.projectStats.byStatus.length === 0 ? (
            <p className="text-sm text-stone-600">No projects yet.</p>
          ) : (
            <div className="space-y-3">
              {data.projectStats.byStatus.map((s) => (
                <div key={s.status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-stone-700">
                      {s.status}
                    </span>
                    <span className="text-stone-600">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100">
                    <div
                      className="h-2 rounded-full bg-stone-950 transition-all"
                      style={{
                        width: `${(s.count / Math.max(...data.projectStats.byStatus.map((c) => c.count))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-950">
            <BookOpen size={18} strokeWidth={1.8} />
            Journal Entries per Month
          </h3>
          {data.journalStats.byMonth.length === 0 ? (
            <p className="text-sm text-stone-600">No journal entries yet.</p>
          ) : (
            <div className="space-y-3">
              {data.journalStats.byMonth.map((m) => {
                const maxCount = Math.max(
                  ...data.journalStats.byMonth.map((bm) => bm.count)
                );
                const monthLabel = formatMonth(m.month);
                return (
                  <div key={m.month}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-stone-700">
                        {monthLabel}
                      </span>
                      <span className="text-stone-600">{m.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100">
                      <div
                        className="h-2 rounded-full bg-stone-950 transition-all"
                        style={{
                          width: `${(m.count / maxCount) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-950">
            <Flag size={18} strokeWidth={1.8} />
            Priority Completion
          </h3>
          {data.priorityStats.total === 0 ? (
            <p className="text-sm text-stone-600">No priorities yet.</p>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative flex size-32 items-center justify-center">
                <svg className="size-32 -rotate-90" viewBox="0 0 128 128">
                  <circle
                    className="stroke-stone-100"
                    cx="64"
                    cy="64"
                    fill="none"
                    r="56"
                    strokeWidth="12"
                  />
                  <circle
                    className="stroke-stone-950"
                    cx="64"
                    cy="64"
                    fill="none"
                    r="56"
                    strokeWidth="12"
                    strokeDasharray={`${(data.priorityStats.rate / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-2xl font-semibold text-stone-950">
                  {data.priorityStats.rate}%
                </span>
              </div>
              <p className="text-sm text-stone-600">
                {data.priorityStats.completed} of {data.priorityStats.total}{" "}
                completed
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-stone-600">
        <Icon size={16} strokeWidth={1.8} />
        <span className="text-xs font-medium uppercase tracking-[0.1em]">
          {label}
        </span>
      </div>
      <p className="text-2xl font-semibold text-stone-950">{value}</p>
      {subtext ? (
        <p className="mt-1 text-sm text-stone-600">{subtext}</p>
      ) : null}
    </div>
  );
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en", { year: "numeric", month: "short" });
}
