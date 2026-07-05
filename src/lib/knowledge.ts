import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { dataRoot } from "@/lib/paths";

export type KnowledgeFile = {
  title: string;
  file: string;
  source: string;
  duplicateSources: string[];
  level: number;
  tags: string[];
};

export type KnowledgeIndex = {
  version: number;
  canonicalSource: string;
  duplicateSources: string[];
  duplicateSections: {
    duplicateSource: string;
    canonicalSource: string;
    reason: string;
    handling: string;
  }[];
  tags: string[];
  topics: Record<string, string[]>;
  files: KnowledgeFile[];
};

export type KnowledgeLibrary = KnowledgeIndex & {
  filesByTag: Record<string, KnowledgeFile[]>;
};

export type KnowledgeLibraryWithContent = Omit<KnowledgeLibrary, "files"> & {
  files: (KnowledgeFile & { content: string })[];
};

export type SelectedKnowledge = {
  tags: string[];
  files: (KnowledgeFile & { content: string })[];
};

const knowledgeRoot = path.join(dataRoot, "02-knowledge");
const indexPath = path.join(knowledgeRoot, "knowledge-index.json");

const tagKeywords: Record<string, string[]> = {
  GIS: [
    "gis",
    "qgis",
    "remote sensing",
    "ndvi",
    "soil",
    "soil mapping",
    "coneat",
    "land suitability",
    "agriculture",
    "agricultural",
    "uruguay",
    "google earth engine",
    "gee",
    "map",
    "mapping"
  ],
  Portfolio: [
    "portfolio",
    "case study",
    "case studies",
    "deliverable",
    "github",
    "website",
    "project sequence"
  ],
  Masters: [
    "master",
    "masters",
    "maestria",
    "admission",
    "fagro",
    "udelar",
    "advisor",
    "thesis",
    "academic",
    "application"
  ],
  Freelancing: [
    "freelance",
    "freelancing",
    "upwork",
    "proposal",
    "client",
    "income",
    "service package",
    "outreach",
    "$1,000",
    "remote job"
  ],
  Spanish: ["spanish", "b1", "b2", "language", "fluency"],
  Branding: [
    "branding",
    "brand",
    "linkedin",
    "profile",
    "headline",
    "positioning",
    "platform"
  ],
  Resources: [
    "resource",
    "resources",
    "links",
    "source",
    "data source",
    "official",
    "course"
  ],
  Career: [
    "career",
    "job",
    "role",
    "title",
    "position",
    "remote",
    "salary",
    "income"
  ]
};

export const loadKnowledgeIndex = cache(async function loadKnowledgeIndex(): Promise<KnowledgeIndex> {
  const rawIndex = await readFile(indexPath, "utf8");

  return JSON.parse(rawIndex.replace(/^\uFEFF/, "")) as KnowledgeIndex;
});

export async function getKnowledgeLibrary(): Promise<KnowledgeLibrary> {
  const index = await loadKnowledgeIndex();
  const filesByTag = Object.fromEntries(
    index.tags.map((tag) => [
      tag,
      index.files.filter((file) => file.tags.includes(tag))
    ])
  );

  return { ...index, filesByTag };
}

export async function getKnowledgeLibraryWithContent(): Promise<KnowledgeLibraryWithContent> {
  const library = await getKnowledgeLibrary();
  const files = await Promise.all(
    library.files.map(async (file) => ({
      ...file,
      content: await readFile(path.join(knowledgeRoot, file.file), "utf8")
    }))
  );

  return { ...library, files };
}

export async function getKnowledgeIndexSummary(): Promise<string> {
  const index = await loadKnowledgeIndex();
  const topicLines = index.tags.map((tag) => {
    const files = index.topics[tag] ?? [];

    return `- ${tag}: ${files.length} indexed files`;
  });
  const fileLines = index.files.map((file) =>
    `- ${file.title} -> ${file.file} [${file.tags.join(", ")}]`
  );

  return [
    `Canonical source: ${index.canonicalSource}`,
    `Duplicate sources: ${index.duplicateSources.join(", ") || "None"}`,
    "",
    "Topics:",
    topicLines.join("\n"),
    "",
    "Files:",
    fileLines.join("\n")
  ].join("\n");
}

export async function selectKnowledgeForMessage(
  userMessage: string,
  limit = 8
): Promise<SelectedKnowledge> {
  const index = await loadKnowledgeIndex();
  const selectedTags = selectTags(userMessage, index.tags);
  const normalizedMessage = userMessage.toLowerCase();
  const candidates = index.files
    .filter((file) => file.tags.some((tag) => selectedTags.includes(tag)))
    .map((file) => ({
      file,
      score: scoreKnowledgeFile(file, selectedTags, normalizedMessage)
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.file.file.localeCompare(b.file.file))
    .slice(0, limit)
    .map((candidate) => candidate.file);

  const files = await Promise.all(
    candidates.map(async (file) => ({
      ...file,
      content: await readFile(path.join(knowledgeRoot, file.file), "utf8")
    }))
  );

  return { tags: selectedTags, files };
}

function selectTags(userMessage: string, availableTags: string[]) {
  const message = userMessage.toLowerCase();
  const selected = availableTags.filter((tag) =>
    tagKeywords[tag]?.some((keyword) => message.includes(keyword))
  );

  return selected.length > 0 ? selected : ["GIS"];
}

function scoreKnowledgeFile(
  file: KnowledgeFile,
  selectedTags: string[],
  normalizedMessage: string
) {
  let score = file.tags.filter((tag) => selectedTags.includes(tag)).length * 10;
  const title = file.title.toLowerCase();
  const pathValue = file.file.toLowerCase();

  for (const word of normalizedMessage.split(/[^a-z0-9$]+/).filter(Boolean)) {
    if (word.length < 3) {
      continue;
    }

    if (title.includes(word)) {
      score += 5;
    }

    if (pathValue.includes(word)) {
      score += 2;
    }
  }

  return score;
}
