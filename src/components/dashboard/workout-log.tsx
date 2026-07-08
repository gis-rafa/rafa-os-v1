"use client";

import { Dumbbell, Plus, Minus, Check } from "lucide-react";

type ExerciseLog = {
  exerciseName: string;
  setsCompleted: number;
  totalSets: number;
  done: boolean;
};

export function WorkoutLog({
  dayOfWeek,
  todayLogs,
  onLogSet,
}: {
  dayOfWeek: number;
  todayLogs: ExerciseLog[];
  onLogSet: (exerciseName: string, setsCompleted: number, totalSets: number) => void;
}) {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[dayOfWeek];
  const doneCount = todayLogs.filter((l) => l.done).length;

  if (todayLogs.length === 0) return null;

  return (
    <section
      className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <Dumbbell size={13} strokeWidth={2} />
          Workout &mdash; {dayName}
        </div>
        <span className="text-sm font-medium text-stone-500">
          {doneCount}/{todayLogs.length}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {todayLogs.map((log) => (
          <div
            key={log.exerciseName}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-200 ${
              log.done
                ? "border-emerald-100 bg-emerald-50/30"
                : "border-stone-100 bg-stone-50/60 hover:border-stone-200 hover:bg-stone-100"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                  log.done
                    ? "bg-emerald-500 text-white"
                    : "bg-stone-200 text-stone-500"
                }`}
              >
                {log.done ? (
                  <Check size={12} strokeWidth={3} className="animate-scale-in" />
                ) : (
                  log.totalSets
                )}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium transition-all duration-200 ${
                    log.done ? "text-stone-400 line-through" : "text-stone-800"
                  }`}
                >
                  {log.exerciseName}
                </p>
                {!log.done && (
                  <p className="text-xs text-stone-400">{log.totalSets} sets</p>
                )}
              </div>
            </div>
            {!log.done && (
              <SetCounter
                exerciseName={log.exerciseName}
                setsCompleted={log.setsCompleted}
                totalSets={log.totalSets}
                onLogSet={onLogSet}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SetCounter({
  exerciseName,
  setsCompleted,
  totalSets,
  onLogSet,
}: {
  exerciseName: string;
  setsCompleted: number;
  totalSets: number;
  onLogSet: (name: string, sets: number, total: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        className="inline-flex size-8 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 transition-all duration-150 hover:bg-stone-100 hover:text-stone-700 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={setsCompleted <= 0}
        onClick={() => onLogSet(exerciseName, Math.max(0, setsCompleted - 1), totalSets)}
        type="button"
        aria-label="Decrease sets"
      >
        <Minus size={13} />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums text-stone-800">
        {setsCompleted}/{totalSets}
      </span>
      <button
        className="inline-flex size-8 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 transition-all duration-150 hover:bg-stone-100 hover:text-stone-700 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={setsCompleted >= totalSets}
        onClick={() => onLogSet(exerciseName, Math.min(totalSets, setsCompleted + 1), totalSets)}
        type="button"
        aria-label="Increase sets"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}
