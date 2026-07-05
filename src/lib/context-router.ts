import {
  getActiveContextFields,
  getMasterBrainMarkdown
} from "@/lib/master-brain";
import {
  getKnowledgeIndexSummary,
  selectKnowledgeForMessage
} from "@/lib/knowledge";
import { generateMorningBrief } from "@/lib/morning-brief";
import { searchRelevantMemoriesForMessage } from "@/lib/memories";
import { getDb, inboxEntries, executionProjects } from "@/db";
import { desc, eq } from "drizzle-orm";

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

export async function buildRoutedPrompt(userMessage: string, userId: string): Promise<RoutedContext> {
  const decisions = routeContext(userMessage);
  const loaded: string[] = [];
  const skipped: string[] = [];
  const contextBlocks: string[] = [];

  for (const decision of decisions) {
    if (!decision.load) {
      skipped.push(`- ${decision.key}: ${decision.reason}`);
      continue;
    }

    const content = await loadContext(decision.key, userMessage, userId);

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

  const conflictCheck = detectGoalConflicts(userMessage);

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

    ...(conflictCheck
      ? [
          "## ⚠️ Goal Conflict Detected",
          `The user's message may conflict with the following goal: "${conflictCheck.goal}".`,
          `Reason: ${conflictCheck.reason}.`,
          "Before responding, explicitly address this conflict. Explain why it conflicts and propose an alternative that aligns better with Rafa's long-term mission.",
          ""
        ]
      : []),

    "## Context Router",
    report,
    "",
    "## Loaded Context (sorted by relevance)",
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

function detectGoalConflicts(
  message: string
): { goal: string; reason: string } | null {
  const msg = message.toLowerCase();

  const avoidancePatterns = [
    { keywords: ["skip", "not today", "later", "procrastinate", "delay"], goal: "Avoid procrastination" },
    { keywords: ["too hard", "too difficult", "give up", "quit"], goal: "Persist through challenges" },
    { keywords: ["unhealthy", "junk food", "skip gym", "skip workout", "skip exercise"], goal: "Maintain physical health" },
    { keywords: ["skip study", "skip learning", "waste time", "binge"], goal: "Prioritize learning goals" },
    { keywords: ["oversleep", "wake up late", "skip morning"], goal: "Maintain consistent routine" }
  ];

  for (const pattern of avoidancePatterns) {
    if (pattern.keywords.some((kw) => msg.includes(kw))) {
      return {
        goal: pattern.goal,
        reason: `Message contains keywords suggesting avoidance behavior (${pattern.keywords.find((kw) => msg.includes(kw))})`
      };
    }
  }

  return null;
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

async function loadContext(key: ContextKey, userMessage: string, userId: string) {
  switch (key) {
    case "MASTER-BRAIN":
      return getMasterBrainMarkdown(userId);
    case "Active Context": {
      const activeContext = await getActiveContextFields(userId);
      return activeContext
        .map((field) => `- ${field.label}: ${field.value}`)
        .join("\n");
    }
    case "Morning Brief": {
      const activeContext = await getActiveContextFields(userId);
      const brief = await generateMorningBrief(activeContext, userId);

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
      return getKnowledgeIndexSummary(userId);
    case "Inbox":
      return listInboxEntriesForContext(userId);
    case "Projects":
      return listProjectsForContext(userId);
    case "Knowledge":
      return readRelevantKnowledge(userId, userMessage);
    case "Memory":
      return readRelevantMemories(userId, userMessage);
  }
}

async function readRelevantMemories(userId: string, userMessage: string) {
  const relevantMemories = await searchRelevantMemoriesForMessage(
    userId,
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

async function readRelevantKnowledge(userId: string, userMessage: string) {
  const selected = await selectKnowledgeForMessage(userId, userMessage);

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

async function listInboxEntriesForContext(userId: string) {
  const db = getDb();
  const entries = await db
    .select()
    .from(inboxEntries)
    .where(eq(inboxEntries.userId, userId))
    .orderBy(desc(inboxEntries.createdAt))
    .limit(8);

  if (entries.length === 0) return "";

  return entries.map((entry, i) =>
    [`### Inbox Entry ${i + 1}`, `Created: ${entry.createdAt.toISOString()}`, "", entry.content.trim()].join("\n")
  ).join("\n\n");
}

async function listProjectsForContext(userId: string) {
  const db = getDb();
  const projects = await db
    .select()
    .from(executionProjects)
    .where(eq(executionProjects.userId, userId))
    .orderBy(desc(executionProjects.updatedAt))
    .limit(5);

  if (projects.length === 0) return "";

  return projects.map((p) =>
    [`### ${p.name}`, `Status: ${p.status} | Phase: ${p.currentPhase} | Priority: ${p.priority}`, p.description].join("\n")
  ).join("\n\n");
}
