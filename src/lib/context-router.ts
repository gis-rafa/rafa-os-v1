import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  getActiveContextFields,
  getMasterBrainMarkdown
} from "@/lib/master-brain";
import {
  getKnowledgeIndexSummary,
  selectKnowledgeForMessage
} from "@/lib/knowledge";
import { generateMorningBrief } from "@/lib/morning-brief";
import { dataRoot } from "@/lib/paths";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { searchRelevantMemoriesForMessage } from "@/lib/memories";

type ContextKey =
  | "MASTER-BRAIN"
  | "Active Context"
  | "Morning Brief"
  | "Knowledge Index"
  | "Inbox"
  | "Projects"
  | "Knowledge"
  | "Memory";

type ContextDecision = {
  key: ContextKey;
  load: boolean;
  reason: string;
};

export type RoutedContext = {
  prompt: string;
  report: string;
};

export async function buildRoutedPrompt(userMessage: string): Promise<RoutedContext> {
  const decisions = routeContext(userMessage);
  const loaded: string[] = [];
  const skipped: string[] = [];
  const contextBlocks: string[] = [];

  for (const decision of decisions) {
    if (!decision.load) {
      skipped.push(`- ${decision.key}: ${decision.reason}`);
      continue;
    }

    const content = await loadContext(decision.key, userMessage);

    loaded.push(`- ${decision.key}: ${decision.reason}`);
    contextBlocks.push([
      `## ${decision.key}`,
      content || "No local notes found."
    ].join("\n"));
  }

  const report = [
    "# Context Router Report",
    "",
    "## Loaded",
    loaded.join("\n") || "- None",
    "",
    "## Skipped",
    skipped.join("\n") || "- None"
  ].join("\n");

  const prompt = [
    "# RAFA AI SYSTEM PROMPT",
    "",
    "## System Role",
    "You are RAFA AI.",
    "",
    "Your only purpose is to help Rafa achieve his long-term mission.",
    "",
    "You understand his goals, projects, ADHD, health, relationships, career, GIS roadmap, master's preparation, and personal operating system.",
    "",
    "You optimize for long-term progress instead of short-term comfort.",
    "",
    "You should challenge avoidance, reduce cognitive load, protect focus, and always align recommendations with Rafa's mission and Decision Rules.",
    "",
    "Never forget the Master Brain.",
    "",
    "Always load only the minimum relevant knowledge.",
    "",
    "If current actions conflict with long-term goals, explain the conflict before answering.",
    "",
    "Always prefer execution over endless planning.",
    "",
    "## Response Rules",
    "- Response length: Medium.",
    "- Always analyze before giving advice.",
    "- Give one recommendation, then 3 concrete next actions.",
    "- Ask at most one follow-up question, only if necessary.",
    "- If confidence is low, ask questions instead of guessing.",
    "- If Rafa is making a harmful or high-risk decision, challenge it respectfully before helping.",
    "- Prioritize Health, Long-term career goals, then Relationships.",
    "- If a plan is unrealistic, propose a more realistic alternative and explain why.",
    "- Be direct, structured, and honest.",
    "- Reduce cognitive load whenever possible.",
    "",
    "## Context Router",
    report,
    "",
    "## Loaded Context",
    contextBlocks.join("\n\n") || "No local context loaded.",
    "",
    "## User Message",
    userMessage,
    "",
    "## Task",
    "Analyze the user's message using only the loaded context. Before advising, check for conflict with Rafa's long-term goals and Decision Rules. Then produce the final answer according to the response rules."
  ].join("\n");

  return { prompt, report };
}

function routeContext(userMessage: string): ContextDecision[] {
  const message = userMessage.toLowerCase();
  const hasAny = (keywords: string[]) =>
    keywords.some((keyword) => message.includes(keyword));

  const needsActiveContext = hasAny([
    "today",
    "now",
    "current",
    "priority",
    "focus",
    "week",
    "goal",
    "plan",
    "next"
  ]);
  const needsInbox = hasAny([
    "inbox",
    "thought",
    "idea",
    "problem",
    "dump",
    "capture",
    "note"
  ]);
  const needsProjects = hasAny([
    "project",
    "task",
    "build",
    "feature",
    "roadmap",
    "ship",
    "progress"
  ]);
  const needsKnowledge = hasAny([
    "learn",
    "study",
    "knowledge",
    "gis",
    "qgis",
    "soil",
    "coneat",
    "uruguay",
    "portfolio",
    "freelance",
    "freelancing",
    "spanish",
    "branding",
    "master",
    "career",
    "research",
    "explain"
  ]);
  const needsMemory = hasAny([
    "remember",
    "memory",
    "preference",
    "pattern",
    "relationship",
    "health",
    "adhd",
    "decision",
    "history"
  ]);

  return [
    {
      key: "MASTER-BRAIN",
      load: true,
      reason: "Always loaded as the control plane for identity, mission, rules, and constraints."
    },
    {
      key: "Active Context",
      load: true,
      reason: needsActiveContext
        ? "Always loaded; especially relevant because the message asks about current goals, priorities, focus, planning, or next steps."
        : "Always loaded so the conversation stays aligned with Rafa's current state."
    },
    {
      key: "Morning Brief",
      load: true,
      reason: "Always loaded before conversation so the answer aligns with today's objective, GIS task, risk, and next action."
    },
    {
      key: "Knowledge Index",
      load: true,
      reason: "Always loaded as a compact map of available knowledge before selecting minimum relevant knowledge files."
    },
    {
      key: "Inbox",
      load: needsInbox,
      reason: needsInbox
        ? "Loaded because the message references thoughts, ideas, problems, notes, or captured inbox material."
        : "Skipped because the message does not reference inbox-style captured thoughts or notes."
    },
    {
      key: "Projects",
      load: needsProjects,
      reason: needsProjects
        ? "Loaded because the message references projects, tasks, shipping, roadmap, progress, or features."
        : "Skipped because the message does not ask about project execution or project state."
    },
    {
      key: "Knowledge",
      load: needsKnowledge,
      reason: needsKnowledge
        ? "Loaded only the matching indexed knowledge files for the message topic."
        : "Skipped because the message does not require reusable learning or domain knowledge."
    },
    {
      key: "Memory",
      load: true,
      reason: needsMemory
        ? "Queried PostgreSQL memories for this user because the message explicitly references memory, preferences, patterns, health, ADHD, relationships, decisions, or history."
        : "Queried PostgreSQL memories for this user and will inject only matching records, if any."
    }
  ];
}

async function loadContext(key: ContextKey, userMessage: string) {
  switch (key) {
    case "MASTER-BRAIN":
      return getMasterBrainMarkdown();
    case "Active Context": {
      const activeContext = await getActiveContextFields();
      return activeContext
        .map((field) => `- ${field.label}: ${field.value}`)
        .join("\n");
    }
    case "Morning Brief": {
      const activeContext = await getActiveContextFields();
      const brief = await generateMorningBrief(activeContext);

      return [
        `- Date: ${brief.dateLabel}`,
        `- Roadmap Day: ${brief.roadmapDay}`,
        `- Today's Primary Objective: ${brief.primaryObjective}`,
        `- Current Weekly Priority: ${brief.weeklyPriority}`,
        `- Recommended GIS Study Task: ${brief.gisStudyTask}`,
        `- Active Project To Continue: ${brief.activeProject}`,
        `- Health Reminder: ${brief.healthReminder}`,
        brief.relationshipReminder
          ? `- Relationship Reminder: ${brief.relationshipReminder}`
          : null,
        `- Biggest Risk: ${brief.biggestRisk}`,
        `- Next Action Under 10 Minutes: ${brief.nextAction}`
      ]
        .filter((line): line is string => Boolean(line))
        .join("\n");
    }
    case "Knowledge Index":
      return getKnowledgeIndexSummary();
    case "Inbox":
      return readMarkdownFolder(path.join(dataRoot, "memory", "inbox"));
    case "Projects":
      return readMarkdownFolder(path.join(dataRoot, "01-projects"));
    case "Knowledge":
      return readRelevantKnowledge(userMessage);
    case "Memory":
      return readRelevantMemories(userMessage);
  }
}

async function readRelevantMemories(userMessage: string) {
  const user = await requireCurrentDbUser();
  const relevantMemories = await searchRelevantMemoriesForMessage(
    user.id,
    userMessage
  );

  if (relevantMemories.length === 0) {
    return "";
  }

  return [
    "## Relevant User Memories",
    ...relevantMemories.map((memory) =>
      [
        `### ${memory.title}`,
        `Category: ${memory.category}`,
        `Tags: ${memory.tags.join(", ") || "None"}`,
        `Importance: ${memory.importance}/5`,
        "",
        memory.content.trim()
      ].join("\n")
    )
  ].join("\n\n");
}

async function readRelevantKnowledge(userMessage: string) {
  const selected = await selectKnowledgeForMessage(userMessage);

  if (selected.files.length === 0) {
    return "";
  }

  return [
    "## Selected Knowledge",
    `Tags: ${selected.tags.join(", ")}`,
    "",
    ...selected.files.map((file) =>
      [
        `### ${file.file}`,
        `Title: ${file.title}`,
        `Tags: ${file.tags.join(", ")}`,
        "",
        file.content.trim()
      ].join("\n")
    )
  ].join("\n\n");
}

async function readMarkdownFolder(folderPath: string) {
  try {
    const files = await readMarkdownFiles(folderPath);
    const limitedFiles = files.slice(0, 8);
    const contents = await Promise.all(
      limitedFiles.map(async (filePath) => {
        const content = await readFile(filePath, "utf8");
        const relativePath = path.relative(dataRoot, filePath);

        return [`### ${relativePath}`, content.trim()].join("\n");
      })
    );

    return contents.join("\n\n");
  } catch {
    return "";
  }
}

async function readMarkdownFiles(folderPath: string): Promise<string[]> {
  const entries = await readdir(folderPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(folderPath, entry.name);

      if (entry.isDirectory()) {
        return readMarkdownFiles(entryPath);
      }

      if (entry.isFile() && entry.name.endsWith(".md")) {
        return [entryPath];
      }

      return [];
    })
  );

  return files.flat().sort();
}
