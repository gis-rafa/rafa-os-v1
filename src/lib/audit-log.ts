import { getDb, auditLog } from "@/db";
import { and, desc, eq } from "drizzle-orm";

export type AuditEntry = {
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export async function createAuditEntry(
  userId: string,
  entry: AuditEntry
) {
  const [result] = await getDb()
    .insert(auditLog)
    .values({
      userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata ?? null
    })
    .returning();

  return result;
}

export async function listAuditEntries(
  userId: string,
  options?: { limit?: number; entityType?: string; action?: string }
) {
  const conditions = [eq(auditLog.userId, userId)];

  if (options?.entityType) {
    conditions.push(eq(auditLog.entityType, options.entityType));
  }
  if (options?.action) {
    conditions.push(eq(auditLog.action, options.action));
  }

  return getDb()
    .select()
    .from(auditLog)
    .where(and(...conditions))
    .orderBy(desc(auditLog.createdAt))
    .limit(options?.limit ?? 50);
}
