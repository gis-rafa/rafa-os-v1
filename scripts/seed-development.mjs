import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

loadEnvFile(".env.local");
loadEnvFile(".env");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log("DATABASE_URL is not configured. Skipping seed.");
  process.exit(0);
}

const pool = new pg.Pool({ connectionString: normalizePgConnectionUrl(databaseUrl) });
const client = await pool.connect();

try {
  await client.query("begin");
  const userId = await ensureLocalUser(client);
  const hasSeed = await hasSeededWorkspace(client, userId);

  if (hasSeed) {
    await client.query("commit");
    console.log("Development workspace already seeded.");
    process.exit(0);
  }

  await seedWorkspace(client, userId);
  await client.query("commit");
  console.log("Development workspace seeded.");
} catch (error) {
  await client.query("rollback");
  console.error(error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}

async function ensureLocalUser(db) {
  const existing = await db.query(
    `select id from users where clerk_user_id = $1 limit 1`,
    ["local-development-rafa"]
  );

  if (existing.rows[0]) {
    return existing.rows[0].id;
  }

  const created = await db.query(
    `insert into users (clerk_user_id, email, name)
     values ($1, $2, $3)
     returning id`,
    ["local-development-rafa", "rafa.local@rafa-os.dev", "Abdallah Rafa"]
  );

  return created.rows[0].id;
}

async function hasSeededWorkspace(db, userId) {
  const existing = await db.query(
    `select id from execution_projects
     where user_id = $1 and name = $2
     limit 1`,
    [userId, "GIS Portfolio Launch"]
  );

  return Boolean(existing.rows[0]);
}

async function seedWorkspace(db, userId) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const projects = await db.query(
    `insert into execution_projects
      (user_id, name, description, status, priority, current_phase, progress, target_date, color, icon)
     values
      ($1, $2, $3, 'Active', 'High', 'Roadmap Execution', 28, $4, 'green', 'map'),
      ($1, $5, $6, 'Active', 'High', 'Case Study Foundation', 34, $7, 'green', 'map'),
      ($1, $8, $9, 'Active', 'High', 'Positioning', 22, $10, 'purple', 'briefcase')
     returning id, name`,
    [
      userId,
      "GIS Study",
      "Daily GIS roadmap execution. This is the highest-priority work because it directly builds Rafa's remote GIS career.",
      addDays(today, 30),
      "GIS Portfolio Launch",
      "Build and publish GIS portfolio case studies that prove Rafa can deliver remote GIS work.",
      addDays(today, 45),
      "Personal Branding",
      "LinkedIn, portfolio site, and public proof of work that support a remote GIS career without distracting from execution.",
      addDays(today, 45)
    ]
  );
  const projectIdByName = new Map(
    projects.rows.map((project) => [project.name, project.id])
  );
  const gisProjectId = projectIdByName.get("GIS Study");
  const portfolioProjectId = projectIdByName.get("GIS Portfolio Launch");
  const brandProjectId = projectIdByName.get("Personal Branding");

  await db.query(
    `insert into execution_priorities (user_id, title, priority_date)
     values ($1, $2, $5), ($1, $3, $5), ($1, $4, $5)`,
    [
      userId,
      "GIS Study: complete today's roadmap task at 13:00.",
      "GIS Portfolio: move one case-study deliverable forward at 16:00.",
      "Personal Branding: publish or draft one LinkedIn/portfolio action at 20:00.",
      today
    ]
  );

  await db.query(
    `insert into execution_tasks
      (user_id, project_id, title, task_date, status, priority, estimated_minutes)
     values
      ($1, $2, $3, $9, 'In Progress', 'High', 35),
      ($1, $2, $4, $9, 'Todo', 'High', 60),
      ($1, $5, $6, $9, 'Todo', 'Medium', 25),
      ($1, $7, $8, $10, 'Todo', 'Medium', 20)`,
    [
      userId,
      gisProjectId,
      "11:00 GIS Deep Work: build core remote GIS skill",
      "13:00 GIS Study: complete today's roadmap task",
      portfolioProjectId,
      "16:00 GIS Portfolio: improve one portfolio deliverable",
      brandProjectId,
      "20:00 Personal Branding: LinkedIn or portfolio content",
      today,
      tomorrow
    ]
  );

  await db.query(
    `insert into memories
      (user_id, project_id, category, title, content, tags, importance)
     values
      ($1, $2, 'GIS', $3, $4, $5, 5),
      ($1, $6, 'Learning', $7, $8, $9, 4),
      ($1, $10, 'Career', $11, $12, $13, 4)`,
    [
      userId,
      gisProjectId,
      "Primary mission",
      "Primary mission: become a Remote GIS Professional. GIS Study is the highest priority, followed by GIS Portfolio, Personal Branding, English, and Physical Training.",
      ["gis", "career", "remote-work", "mission"],
      gisProjectId,
      "Daily mission schedule",
      "Daily schedule: 08:00 wake up, 08:30 morning brief, 09:00 gym, 11:00 GIS deep work, 13:00 GIS study, 16:00 GIS portfolio, 18:00 English, 20:00 personal branding, 22:30 sleep.",
      ["schedule", "gis", "execution"],
      brandProjectId,
      "Personal branding role",
      "Personal branding should always support the Remote GIS Career mission through LinkedIn, portfolio, and public proof of work.",
      ["branding", "linkedin", "portfolio", "career"]
    ]
  );

  await db.query(
    `insert into project_knowledge_links
      (user_id, project_id, file_path, title, tags)
     values
      ($1, $2, $3, $4, $5),
      ($1, $2, $6, $7, $8),
      ($1, $9, $10, $11, $12)`,
    [
      userId,
      gisProjectId,
      "uruguay-agricultural-gis/02-execution-plan/week-1-qgis-foundation-reset.md",
      "Week 1 QGIS Foundation Reset",
      ["GIS", "Portfolio"],
      "uruguay-agricultural-gis/02-execution-plan/week-3-soil-mapping-with-coneat.md",
      "Week 3 Soil Mapping With CONEAT",
      ["GIS", "Resources"],
      brandProjectId,
      "uruguay-agricultural-gis/02-execution-plan/week-12-portfolio-website-and-outreach.md",
      "Week 12 Portfolio Website and Outreach",
      ["Branding", "Career"]
    ]
  );

  await db.query(
    `insert into study_task_progress (user_id, roadmap_day, status)
     values ($1, 1, 'Done'), ($1, 2, 'In Progress')
     on conflict (user_id, roadmap_day) do nothing`,
    [userId]
  );
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

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function normalizePgConnectionUrl(value) {
  try {
    const url = new URL(value);
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
    return value;
  }
}
