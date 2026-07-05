import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataRoot = path.resolve(__dirname, "..", "data");

async function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, "..", ".env.local");
    const content = await readFile(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (key) process.env[key] = value;
    }
  } catch {}
}

async function getSql() {
  const { neon } = await import("@neondatabase/serverless");
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL not set");
  return neon(databaseUrl);
}

async function seedMasterBrain(userId, sql) {
  const filePath = path.join(dataRoot, "00-core", "MASTER-BRAIN.md");
  try {
    const content = await readFile(filePath, "utf8");
    await sql.query(
      `INSERT INTO documents (user_id, key, content) VALUES ($1, 'master-brain', $2) ON CONFLICT (user_id, key) DO UPDATE SET content = $2, updated_at = NOW()`,
      [userId, content]
    );
    console.log("  seeded MASTER-BRAIN.md");
  } catch {
    console.log("  skipped MASTER-BRAIN.md (not found)");
  }
}

async function seedKnowledgeIndex(userId, sql) {
  const filePath = path.join(dataRoot, "02-knowledge", "knowledge-index.json");
  try {
    const content = await readFile(filePath, "utf8");
    await sql.query(
      `INSERT INTO documents (user_id, key, content) VALUES ($1, 'knowledge-index', $2) ON CONFLICT (user_id, key) DO UPDATE SET content = $2, updated_at = NOW()`,
      [userId, content.replace(/^\uFEFF/, "")]
    );
    console.log("  seeded knowledge-index.json");
  } catch {
    console.log("  skipped knowledge-index.json (not found)");
  }
}

async function seedKnowledgeFiles(userId, sql) {
  const knowledgeRoot = path.join(dataRoot, "02-knowledge");
  try {
    const entries = await readdir(knowledgeRoot);
    let count = 0;
    for (const entry of entries) {
      const fullPath = path.join(knowledgeRoot, entry);
      const stats = await stat(fullPath);
      if (!stats.isFile() || !entry.endsWith(".md")) continue;
      const content = await readFile(fullPath, "utf8");
      const fileKey = `knowledge-file:${entry}`;
      await sql.query(
        `INSERT INTO documents (user_id, key, content) VALUES ($1, $2, $3) ON CONFLICT (user_id, key) DO UPDATE SET content = $3, updated_at = NOW()`,
        [userId, fileKey, content]
      );
      count++;
    }
    console.log(`  seeded ${count} knowledge files`);
  } catch {
    console.log("  skipped knowledge files (folder not found)");
  }
}

async function seedRoadmapTasks(sql) {
  const executionPlanFolder = path.join(
    dataRoot,
    "02-knowledge",
    "uruguay-agricultural-gis",
    "02-execution-plan"
  );
  const executionFiles = [
    "week-1-qgis-foundation-reset.md",
    "week-2-uruguay-data-and-map-discipline.md",
    "week-3-soil-mapping-with-coneat.md",
    "week-4-land-suitability-foundations.md",
    "days-29-30-month-1-sprint-close.md",
    "days-31-35-case-study-1-completion.md",
    "week-6-remote-sensing-basics.md",
    "week-7-google-earth-engine-intro.md",
    "week-8-case-study-2-completion.md",
    "week-9-freelance-service-design.md",
    "week-10-case-study-3-land-due-diligence.md",
    "week-11-master-s-preparation-begins.md",
    "week-12-portfolio-website-and-outreach.md",
    "week-13-90-day-review-and-launch.md"
  ];

  const tasks = [];
  for (const file of executionFiles) {
    const filePath = path.join(executionPlanFolder, file);
    try {
      const content = await readFile(filePath, "utf8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(/^\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
        if (match) {
          const day = parseInt(match[1], 10);
          tasks.push({
            day,
            gisTask: match[2].trim(),
            supportTask: match[3].trim(),
            deliverable: match[4].trim(),
            week: Math.max(1, Math.ceil(day / 7)),
            phase: day <= 30 ? "Month 1 GIS Sprint" : day <= 60 ? "Case Studies and Remote Sensing" : day <= 90 ? "Freelance, Master's, and Launch" : "90-Day Review"
          });
        }
      }
    } catch {}
  }

  tasks.sort((a, b) => a.day - b.day);

  for (const task of tasks) {
    await sql.query(
      `INSERT INTO roadmap_tasks (day, gis_task, support_task, deliverable, week, phase) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (day) DO UPDATE SET gis_task = $2, support_task = $3, deliverable = $4, week = $5, phase = $6`,
      [task.day, task.gisTask, task.supportTask, task.deliverable, task.week, task.phase]
    );
  }
  console.log(`  seeded ${tasks.length} roadmap tasks`);
}

async function main() {
  await loadEnv();
  const sql = await getSql();

  const rows = await sql.query(`SELECT id FROM users LIMIT 1`);
  const userRow = rows[0];
  const userId = userRow?.id;
  if (!userId) {
    console.log("No users found. Run seed-development.mjs first.");
    process.exit(1);
  }

  console.log(`Seeding content for user ${userId}...`);
  await seedMasterBrain(userId, sql);
  await seedKnowledgeIndex(userId, sql);
  await seedKnowledgeFiles(userId, sql);
  await seedRoadmapTasks(sql);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
