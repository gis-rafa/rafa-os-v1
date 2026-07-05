import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

loadEnvFile(".env.local");
loadEnvFile(".env");

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL is not configured. Starting in file-only local mode.");
  process.exit(0);
}

process.env.DATABASE_URL = normalizePgConnectionUrl(process.env.DATABASE_URL);

console.log("Preparing local PostgreSQL workspace...");
runNodeScript("node_modules/drizzle-kit/bin.cjs", ["migrate"]);
runNodeScript("scripts/seed-development.mjs");

function runNodeScript(scriptPath, args = []) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    env: process.env,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    process.env[key] ??= valueParts.join("=").replace(/^["']|["']$/g, "");
  }
}

function normalizePgConnectionUrl(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get("sslmode");
    const needsLibpqCompatibility =
      sslMode && ["prefer", "require", "verify-ca"].includes(sslMode);

    if (
      needsLibpqCompatibility &&
      !url.searchParams.has("uselibpqcompat") &&
      !url.searchParams.has("sslcert")
    ) {
      url.searchParams.set("uselibpqcompat", "true");
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
}
