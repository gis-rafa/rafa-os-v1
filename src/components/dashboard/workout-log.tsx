"use client";

import { Dumbbell, Plus, Minus } from "lucide-react";

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

  const allDone = todayLogs.length > 0 && todayLogs.every((l) => l.done);
  const doneCount = todayLogs.filter((l) => l.done).length;

  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
          <Dumbbell size={18} strokeWidth={1.9} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
            Workout Log &mdash; {dayName}
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            {doneCount}/{todayLogs.length} exercises done
          </p>
        </div>
      </div>

      {todayLogs.length === 0 && (
        <p className="text-sm text-stone-500">No exercises logged yet today.</p>
      )}

      <div className="grid gap-2">
        {todayLogs.map((log) => (
          <div
            key={log.exerciseName}
            className="flex items-center justify-between rounded-md border border-stone-100 bg-stone-50 px-3 py-2 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  log.done
                    ? "text-stone-500 line-through"
                    : "text-stone-800 dark:text-stone-200"
                }`}
              >
                {log.exerciseName}
              </p>
              <p className="text-xs text-stone-400">
                Sets: {log.setsCompleted}/{log.totalSets}
              </p>
            </div>
            {!log.done && (
              <SetCounter
                exerciseName={log.exerciseName}
                setsCompleted={log.setsCompleted}
                totalSets={log.totalSets}
                onLogSet={onLogSet}
              />
            )}
            {log.done && (
              <span className="text-xs font-semibold text-emerald-600">Done</span>
            )}
          </div>
        ))}
      </div>

      {allDone && todayLogs.length > 0 && (
        <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          All exercises complete!
        </div>
      )}
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
        className="inline-flex size-7 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400"
        disabled={setsCompleted <= 0}
        onClick={() => onLogSet(exerciseName, Math.max(0, setsCompleted - 1), totalSets)}
        type="button"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
        {setsCompleted}/{totalSets}
      </span>
      <button
        className="inline-flex size-7 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400"
        disabled={setsCompleted >= totalSets}
        onClick={() => onLogSet(exerciseName, Math.min(totalSets, setsCompleted + 1), totalSets)}
        type="button"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
