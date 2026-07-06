"use server";

import { getDb, isDatabaseConfigured, journalEntries, memories, executionTasks, executionProjects, executionPriorities } from "@/db";
import { getActionUser } from "@/lib/auth-user";
import { eq, sql, desc } from "drizzle-orm";

export type ReportData = {
  memoryStats: { total: number; byCategory: { category: string; count: number }[] };
  journalStats: { total: number; byMonth: { month: string; count: number }[] };
  taskStats: { total: number; completed: number; rate: number };
  projectStats: { total: number; byStatus: { status: string; count: number }[] };
  priorityStats: { total: number; completed: number; rate: number };
};

export async function getReportDataAction(): Promise<ReportData> {
  if (!isDatabaseConfigured()) {
    return {
      memoryStats: { total: 0, byCategory: [] },
      journalStats: { total: 0, byMonth: [] },
      taskStats: { total: 0, completed: 0, rate: 0 },
      projectStats: { total: 0, byStatus: [] },
      priorityStats: { total: 0, completed: 0, rate: 0 }
    };
  }

  const user = await getActionUser();
  const db = getDb();

  const [memoryByCategory, memoriesCount, journalCount, journalByMonth, taskStats, projectByStatus, priorityStats] =
    await Promise.all([
      db
        .select({ category: memories.category, count: sql<number>`count(*)::int` })
        .from(memories)
        .where(eq(memories.userId, user.id))
        .groupBy(memories.category)
        .orderBy(desc(sql`count(*)`)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(memories)
        .where(eq(memories.userId, user.id))
        .then((r) => r[0]?.count ?? 0),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(journalEntries)
        .where(eq(journalEntries.userId, user.id))
        .then((r) => r[0]?.count ?? 0),
      db
        .select({
          month: sql<string>`to_char(${journalEntries.createdAt}, 'YYYY-MM')`,
          count: sql<number>`count(*)::int`
        })
        .from(journalEntries)
        .where(eq(journalEntries.userId, user.id))
        .groupBy(sql`to_char(${journalEntries.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${journalEntries.createdAt}, 'YYYY-MM')`),
      db
        .select({
          total: sql<number>`count(*)::int`,
          completed: sql<number>`count(*) filter (where ${executionTasks.status} = 'Done')::int`
        })
        .from(executionTasks)
        .where(eq(executionTasks.userId, user.id))
        .then((r) => {
          const row = r[0];
          return { total: row?.total ?? 0, completed: row?.completed ?? 0 };
        }),
      db
        .select({ status: executionProjects.status, count: sql<number>`count(*)::int` })
        .from(executionProjects)
        .where(eq(executionProjects.userId, user.id))
        .groupBy(executionProjects.status),
      db
        .select({
          total: sql<number>`count(*)::int`,
          completed: sql<number>`count(*) filter (where ${executionPriorities.completedAt} is not null)::int`
        })
        .from(executionPriorities)
        .where(eq(executionPriorities.userId, user.id))
        .then((r) => {
          const row = r[0];
          return { total: row?.total ?? 0, completed: row?.completed ?? 0 };
        })
    ]);

  return {
    memoryStats: {
      total: memoriesCount,
      byCategory: memoryByCategory
    },
    journalStats: {
      total: journalCount,
      byMonth: journalByMonth
    },
    taskStats: {
      ...taskStats,
      rate: taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0
    },
    projectStats: {
      total: projectByStatus.reduce((sum, s) => sum + s.count, 0),
      byStatus: projectByStatus
    },
    priorityStats: {
      ...priorityStats,
      rate: priorityStats.total > 0 ? Math.round((priorityStats.completed / priorityStats.total) * 100) : 0
    }
  };
}
