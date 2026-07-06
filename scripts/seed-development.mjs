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

async function seedWorkspace(db, userId) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const projects = await db.query(
    `insert into execution_projects
      (user_id, name, description, status, priority, current_phase, progress, target_date, color, icon)
     values
      ($1, $2, $3, 'Active', 'High', 'Roadmap Execution', 42, $4, 'green', 'map'),
      ($1, $5, $6, 'Active', 'High', 'Final Cartographic Layout', 90, $7, 'green', 'map'),
      ($1, $8, $9, 'Active', 'High', 'Positioning', 22, $10, 'purple', 'briefcase')
     on conflict (user_id, name) do update set
       description = excluded.description,
       status = excluded.status,
       priority = excluded.priority,
       current_phase = excluded.current_phase,
       progress = excluded.progress,
       target_date = excluded.target_date,
       color = excluded.color,
       icon = excluded.icon
     returning id, name`,
    [
      userId,
      "GIS Study",
      "Daily GIS roadmap execution. This is the highest-priority work because it directly builds Rafa's remote GIS career.",
      addDays(today, 30),
      "GIS Portfolio Launch",
      "Build and publish GIS portfolio case studies that prove Rafa can deliver remote GIS work. P01 complete, P02 at 90%.",
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
    `delete from execution_priorities where user_id = $1 and priority_date >= $2 and priority_date < $3`,
    [userId, today, addDays(today, 1)]
  );

  await db.query(
    `insert into execution_priorities (user_id, title, priority_date)
     values ($1, $2, $6), ($1, $3, $6), ($1, $4, $6), ($1, $5, $6)`,
    [
      userId,
      "GIS Portfolio: complete Project 02 (CONEAT Soil Map) cartographic layout",
      "Final Cartographic Layout: polish QGIS export for portfolio publication",
      "GIS Study: continue Week 4 Land Suitability Foundations",
      "Personal Branding: draft LinkedIn post for P02 launch",
      today
    ]
  );

  await db.query(
    `delete from execution_tasks where user_id = $1 and task_date >= $2 and task_date < $3`,
    [userId, today, addDays(today, 1)]
  );

  await db.query(
    `insert into execution_tasks
      (user_id, project_id, title, task_date, status, priority, estimated_minutes)
     values
      ($1, $2, $3, $9, 'In Progress', 'High', 60),
      ($1, $2, $4, $9, 'Todo', 'High', 60),
      ($1, $5, $6, $9, 'Todo', 'High', 45),
      ($1, $7, $8, $10, 'Todo', 'Medium', 20)`,
    [
      userId,
      portfolioProjectId,
      "16:00 P02 Cartographic Layout: polish QGIS export for portfolio",
      "17:00 P02 Final Report: write README with full documentation",
      portfolioProjectId,
      "18:00 P02 Portfolio Screenshots: capture map outputs for portfolio",
      brandProjectId,
      "20:00 Personal Branding: draft LinkedIn post announcing P02 completion",
      today,
      tomorrow
    ]
  );

  await db.query(
    `delete from memories where user_id = $1 and title in ('Primary mission', 'Daily mission schedule', 'Personal branding role')`,
    [userId]
  );

  await db.query(
    `insert into memories
      (user_id, project_id, category, title, content, tags, importance)
     values
      ($1, $2, 'GIS', $3, $4, $5, 5),
      ($1, $2, 'Learning', $6, $7, $8, 4),
      ($1, $9, 'Career', $10, $11, $12, 4)`,
    [
      userId,
      gisProjectId,
      "Primary mission",
      "Primary mission: become a Remote GIS Professional. Currently completing P02 (CONEAT Soil Map) at 90%. Next: P03 Land Suitability Analysis.",
      ["gis", "career", "remote-work", "mission", "coneat"],
      "Current GIS progress",
      "Project 01 (Uruguay Base Map): complete. Project 02 (CONEAT Soil Map): 90% complete. Remaining: final cartographic layout, final report, portfolio screenshots, LinkedIn post. Next: Land Suitability Analysis.",
      ["gis", "portfolio", "progress"],
      brandProjectId,
      "Personal branding role",
      "Personal branding should always support the Remote GIS Career mission through LinkedIn, portfolio, and public proof of work.",
      ["branding", "linkedin", "portfolio", "career"]
    ]
  );

  await db.query(
    `delete from project_knowledge_links where user_id = $1`,
    [userId]
  );

  await db.query(
    `insert into project_knowledge_links
      (user_id, project_id, file_path, title, tags)
     values
      ($1, $2, $3, $4, $5),
      ($1, $6, $7, $8, $9),
      ($1, $10, $11, $12, $13)`,
    [
      userId,
      gisProjectId,
      "uruguay-agricultural-gis/05-gis-portfolio/portfolio-project-sequence.md",
      "Portfolio Project Sequence",
      ["GIS", "Portfolio"],
      portfolioProjectId,
      "uruguay-agricultural-gis/02-execution-plan/week-3-soil-mapping-with-coneat.md",
      "Week 3 Soil Mapping With CONEAT",
      ["GIS", "Resources"],
      brandProjectId,
      "uruguay-agricultural-gis/04-branding-roadmap/linkedin-strategy.md",
      "LinkedIn Strategy",
      ["Branding", "Career"]
    ]
  );

  await db.query(
    `insert into study_task_progress (user_id, roadmap_day, status)
     values ($1, 1, 'Done'), ($1, 2, 'Done'), ($1, 3, 'Done'), ($1, 4, 'Done'), ($1, 5, 'Done'),
            ($1, 6, 'Done'), ($1, 7, 'Done'), ($1, 8, 'Done'), ($1, 9, 'Done'), ($1, 10, 'Done'),
            ($1, 11, 'Done'), ($1, 12, 'Done'), ($1, 13, 'Done'), ($1, 14, 'Done'), ($1, 15, 'Done'),
            ($1, 16, 'Done'), ($1, 17, 'Done'), ($1, 18, 'Done'), ($1, 19, 'Done'), ($1, 20, 'Done'),
            ($1, 21, 'In Progress')
     on conflict (user_id, roadmap_day) do update set status = excluded.status, updated_at = now()`,
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
