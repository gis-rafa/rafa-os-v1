import { and, eq } from "drizzle-orm";
import { getDb, documents } from "@/db";

export type MasterBrainSection = {
  title: string;
  content: string;
};

export type MasterBrainDocument = {
  title: string;
  sections: MasterBrainSection[];
};

export type ActiveContextField = {
  label: string;
  value: string;
};

const activeContextLabels = [
  "Current Top Goal",
  "Current Relationship Status",
  "Current Health Focus",
  "Current Learning Focus",
  "Current Career Focus",
  "Current Biggest Challenge",
  "Current Weekly Priority"
];

const MASTER_BRAIN_KEY = "master-brain";

async function getMasterBrainContent(userId: string): Promise<string> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.key, MASTER_BRAIN_KEY)
      )
    )
    .limit(1);

  return row?.content ?? "";
}

async function upsertMasterBrainContent(userId: string, content: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.key, MASTER_BRAIN_KEY)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(documents)
      .set({ content, updatedAt: new Date() })
      .where(eq(documents.id, existing.id));
  } else {
    await db.insert(documents).values({
      userId,
      key: MASTER_BRAIN_KEY,
      content
    });
  }
}

export async function getMasterBrainSections(
  userId: string,
  requestedSections: string[]
): Promise<MasterBrainSection[]> {
  const content = await getMasterBrainContent(userId);
  if (!content) {
    return requestedSections.map((title) => ({ title, content: "TODO" }));
  }
  const sections = parseMarkdownSectionMap(content);
  return requestedSections.map((title) => ({
    title,
    content: sections.get(title) ?? "TODO"
  }));
}

export async function getMasterBrainMarkdown(userId: string): Promise<string> {
  const content = await getMasterBrainContent(userId);
  return content || "# MASTER BRAIN\n\n## Active Context\n\nTODO\n";
}

export async function getMasterBrainDocument(userId: string): Promise<MasterBrainDocument> {
  const content = await getMasterBrainContent(userId);
  if (!content) {
    return { title: "MASTER BRAIN", sections: [] };
  }
  return parseMarkdownDocument(content);
}

export async function saveMasterBrainDocument(
  userId: string,
  document: MasterBrainDocument
): Promise<void> {
  await upsertMasterBrainContent(userId, serializeMarkdownDocument(document));
}

export async function getActiveContextFields(userId: string): Promise<ActiveContextField[]> {
  const content = await getMasterBrainContent(userId);
  if (!content) {
    return activeContextLabels.map((label) => ({ label, value: "TODO" }));
  }
  const sections = parseMarkdownSectionMap(content);
  const activeContext = sections.get("Active Context") ?? "";
  const activeContextFields = parseLabeledFields(activeContext);
  const fallbackFields = parseLabeledFields(content);

  return activeContextLabels.map((label) => ({
    label,
    value:
      activeContextFields.get(label) ??
      fallbackFields.get(label) ??
      "TODO"
  }));
}

function parseMarkdownSectionMap(markdown: string) {
  const document = parseMarkdownDocument(markdown);
  const sections = new Map<string, string>();
  for (const section of document.sections) {
    sections.set(section.title, section.content);
  }
  return sections;
}

function parseMarkdownDocument(markdown: string): MasterBrainDocument {
  const lines = markdown.split(/\r?\n/);
  const title = lines.find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "").trim() ?? "MASTER BRAIN";
  const orderedSections: MasterBrainSection[] = [];
  let currentTitle: string | null = null;
  let currentContent: string[] = [];

  const saveCurrentSection = () => {
    if (!currentTitle) return;
    orderedSections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  };

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      saveCurrentSection();
      currentTitle = match[1].trim();
      currentContent = [];
      continue;
    }
    if (currentTitle) currentContent.push(line);
  }
  saveCurrentSection();

  return { title, sections: orderedSections };
}

function serializeMarkdownDocument(document: MasterBrainDocument) {
  const title = document.title.trim() || "MASTER BRAIN";
  const sections = document.sections.map((section) =>
    `## ${section.title.trim()}\n\n${section.content.trim() || "TODO"}`
  );
  return `# ${title}\n\n${sections.join("\n\n")}\n`;
}

function parseLabeledFields(markdown: string) {
  const fields = new Map<string, string>();
  const labels = new Set(activeContextLabels);
  const lines = markdown.split(/\r?\n/);
  let currentLabel: string | null = null;
  let currentContent: string[] = [];

  const saveCurrentField = () => {
    if (!currentLabel) return;
    fields.set(currentLabel, currentContent.join("\n").trim() || "TODO");
  };

  for (const line of lines) {
    const normalizedLine = line.replace(/^#+\s+/, "").trim();
    if (labels.has(normalizedLine)) {
      saveCurrentField();
      currentLabel = normalizedLine;
      currentContent = [];
      continue;
    }
    if (currentLabel) {
      if (/^#{1,2}\s+/.test(line)) {
        saveCurrentField();
        currentLabel = null;
        currentContent = [];
        continue;
      }
      currentContent.push(line);
    }
  }
  saveCurrentField();

  return fields;
}
