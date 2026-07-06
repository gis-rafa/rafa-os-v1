import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!database) {
    database = drizzle(neon(process.env.DATABASE_URL), { schema });
  }

  return database;
}
