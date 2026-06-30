import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataRoot } from "@/lib/paths";

const masterBrainPath = path.join(
  dataRoot,
  "00-core",
  "MASTER-BRAIN.md"
);

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

export async function getMasterBrainSections(
  requestedSections: string[]
): Promise<MasterBrainSection[]> {
  const file = await readFile(masterBrainPath, "utf8");
  const sections = parseMarkdownSectionMap(file);

  return requestedSections.map((title) => ({
    title,
    content: sections.get(title) ?? "TODO"
  }));
}

export async function getMasterBrainMarkdown(): Promise<string> {
  return readFile(masterBrainPath, "utf8");
}

export async function getMasterBrainDocument(): Promise<MasterBrainDocument> {
  const file = await readFile(masterBrainPath, "utf8");

  return parseMarkdownDocument(file);
}

export async function saveMasterBrainDocument(
  document: MasterBrainDocument
): Promise<void> {
  await writeFile(masterBrainPath, serializeMarkdownDocument(document), "utf8");
}

export async function getActiveContextFields(): Promise<ActiveContextField[]> {
  const file = await readFile(masterBrainPath, "utf8");
  const sections = parseMarkdownSectionMap(file);
  const activeContext = sections.get("Active Context") ?? "";
  const activeContextFields = parseLabeledFields(activeContext);
  const fallbackFields = parseLabeledFields(file);

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
    if (!currentTitle) {
      return;
    }

    const content = currentContent.join("\n").trim();
    orderedSections.push({ title: currentTitle, content });
  };

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);

    if (match) {
      saveCurrentSection();
      currentTitle = match[1].trim();
      currentContent = [];
      continue;
    }

    if (currentTitle) {
      currentContent.push(line);
    }
  }

  saveCurrentSection();

  return {
    title,
    sections: orderedSections
  };
}

function serializeMarkdownDocument(document: MasterBrainDocument) {
  const title = document.title.trim() || "MASTER BRAIN";
  const sections = document.sections.map((section) => {
    const content = section.content.trim() || "TODO";

    return `## ${section.title.trim()}\n\n${content}`;
  });

  return `# ${title}\n\n${sections.join("\n\n")}\n`;
}

function parseLabeledFields(markdown: string) {
  const fields = new Map<string, string>();
  const labels = new Set(activeContextLabels);
  const lines = markdown.split(/\r?\n/);
  let currentLabel: string | null = null;
  let currentContent: string[] = [];

  const saveCurrentField = () => {
    if (!currentLabel) {
      return;
    }

    const value = currentContent.join("\n").trim();
    fields.set(currentLabel, value || "TODO");
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
