import { getDb } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();

  const dbTimeResult = await db.execute(sql`
    SELECT
      CURRENT_DATE AS db_current_date,
      NOW() AS db_now,
      CURRENT_TIMESTAMP AS db_timestamp
  `);
  const dbTime = dbTimeResult.rows[0] as Record<string, unknown> | undefined;

  const serverNow = new Date();
  const serverOffset = serverNow.getTimezoneOffset();

  const taskDatesResult = await db.execute(sql`
    SELECT task_date::text, title, status, priority, project_id
    FROM execution_tasks
    ORDER BY task_date DESC
    LIMIT 30
  `);
  const tasks = taskDatesResult.rows as Record<string, unknown>[];

  const taskCountResult = await db.execute(sql`
    SELECT COUNT(*) AS total
    FROM execution_tasks
  `);
  const taskCount = taskCountResult.rows[0] as Record<string, unknown> | undefined;

  const studyProgressResult = await db.execute(sql`
    SELECT date, status, task_id
    FROM study_task_progress
    ORDER BY date DESC
    LIMIT 10
  `);
  const studyProgress = studyProgressResult.rows as Record<string, unknown>[];

  return Response.json({
    server: {
      now: serverNow.toISOString(),
      localeString: serverNow.toString(),
      timezoneOffset: serverOffset,
      timezoneOffsetHours: serverOffset / -60,
    },
    database: {
      currentDate: dbTime?.db_current_date,
      now: dbTime?.db_now,
      timestamp: dbTime?.db_timestamp,
    },
    tasks: {
      totalCount: taskCount?.total,
      details: tasks.map((t) => ({
        date: t.task_date,
        title: t.title,
        status: t.status,
        priority: t.priority,
      })),
    },
    studyProgress: studyProgress.map((s) => ({
      date: s.date,
      status: s.status,
      taskId: s.task_id,
    })),
  });
}
