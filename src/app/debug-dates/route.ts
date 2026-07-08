import { getDb } from "@/db";
import { sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { getToday, getDayOfWeek } from "@/lib/date-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();

    const cookieTz = (await cookies()).get("__tz")?.value;
    const vercelTz = (await headers()).get("x-vercel-ip-timezone") ?? undefined;
    const effectiveTz = cookieTz ?? vercelTz;

    const todayUtc = getToday();
    const todayTz = getToday(effectiveTz);

    const serverNow = new Date();

    const dateResult = await db.execute(sql`SELECT CURRENT_DATE AS d, NOW() AS n`);
    const dateRow = dateResult.rows[0] as Record<string, unknown> | undefined;

    const taskResult = await db.execute(sql`
      SELECT task_date::text, title, status FROM execution_tasks ORDER BY task_date DESC LIMIT 25
    `);
    const tasks = taskResult.rows as Record<string, unknown>[];

    return Response.json({
      server: {
        now: serverNow.toISOString(),
        localeString: serverNow.toString(),
        timezoneOffset: serverNow.getTimezoneOffset(),
        timezoneCookie: cookieTz,
        timezoneVercel: vercelTz,
        effectiveTimezone: effectiveTz,
        getToday_UTC: todayUtc.toISOString(),
        getToday_TZ: todayTz.toISOString(),
        getDayOfWeek_UTC: getDayOfWeek(),
        getDayOfWeek_TZ: getDayOfWeek(effectiveTz ?? undefined),
      },
      database: {
        currentDate: dateRow?.d as string,
        now: dateRow?.n as string,
      },
      tasks: tasks.map((t: Record<string, unknown>) => ({
        date: t.task_date,
        title: t.title,
        status: t.status,
      })),
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
