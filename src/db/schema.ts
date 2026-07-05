import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  integer,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email"),
    name: text("name"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [uniqueIndex("users_clerk_user_id_idx").on(table.clerkUserId)]
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [index("conversations_user_id_idx").on(table.userId)]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("messages_conversation_id_idx").on(table.conversationId),
    index("messages_created_at_idx").on(table.createdAt)
  ]
);

export const memories = pgTable(
  "memories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => executionProjects.id, {
      onDelete: "set null"
    }),
    category: text("category").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    importance: integer("importance").notNull().default(3),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("memories_user_id_idx").on(table.userId),
    index("memories_project_id_idx").on(table.projectId),
    index("memories_category_idx").on(table.category),
    index("memories_created_at_idx").on(table.createdAt)
  ]
);

export const studyTaskProgress = pgTable(
  "study_task_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roadmapDay: integer("roadmap_day").notNull(),
    status: text("status").notNull().default("Todo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex("study_task_progress_user_day_idx").on(
      table.userId,
      table.roadmapDay
    ),
    index("study_task_progress_user_id_idx").on(table.userId),
    index("study_task_progress_status_idx").on(table.status)
  ]
);

export const executionPriorities = pgTable(
  "execution_priorities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    priorityDate: timestamp("priority_date", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("execution_priorities_user_date_idx").on(
      table.userId,
      table.priorityDate
    ),
    index("execution_priorities_completed_at_idx").on(table.completedAt)
  ]
);

export const executionProjects = pgTable(
  "execution_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    progress: integer("progress").notNull().default(0),
    currentPhase: text("current_phase").notNull().default("Planning"),
    status: text("status").notNull().default("Active"),
    priority: text("priority").notNull().default("Medium"),
    targetDate: timestamp("target_date", { withTimezone: true }),
    color: text("color").notNull().default("stone"),
    icon: text("icon").notNull().default("folder"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("execution_projects_user_status_idx").on(table.userId, table.status),
    index("execution_projects_priority_idx").on(table.priority),
    index("execution_projects_target_date_idx").on(table.targetDate),
    index("execution_projects_updated_at_idx").on(table.updatedAt)
  ]
);

export const projectKnowledgeLinks = pgTable(
  "project_knowledge_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => executionProjects.id, { onDelete: "cascade" }),
    filePath: text("file_path").notNull(),
    title: text("title").notNull(),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex("project_knowledge_links_project_file_idx").on(
      table.projectId,
      table.filePath
    ),
    index("project_knowledge_links_user_id_idx").on(table.userId),
    index("project_knowledge_links_project_id_idx").on(table.projectId)
  ]
);

export const executionTasks = pgTable(
  "execution_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => executionProjects.id, {
      onDelete: "set null"
    }),
    title: text("title").notNull(),
    taskDate: timestamp("task_date", { withTimezone: true })
      .defaultNow()
      .notNull(),
    status: text("status").notNull().default("Todo"),
    priority: text("priority").notNull().default("Medium"),
    estimatedMinutes: integer("estimated_minutes").notNull().default(30),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("execution_tasks_user_date_idx").on(table.userId, table.taskDate),
    index("execution_tasks_status_idx").on(table.status),
    index("execution_tasks_project_id_idx").on(table.projectId)
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("info"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    read: integer("read").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_read_idx").on(table.read)
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  memories: many(memories),
  studyTaskProgress: many(studyTaskProgress),
  executionPriorities: many(executionPriorities),
  executionProjects: many(executionProjects),
  executionTasks: many(executionTasks),
  projectKnowledgeLinks: many(projectKnowledgeLinks),
  notifications: many(notifications),
  journalEntries: many(journalEntries)
}));

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id]
  }),
  messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  })
}));

export const memoriesRelations = relations(memories, ({ one }) => ({
  user: one(users, {
    fields: [memories.userId],
    references: [users.id]
  }),
  project: one(executionProjects, {
    fields: [memories.projectId],
    references: [executionProjects.id]
  })
}));

export const studyTaskProgressRelations = relations(
  studyTaskProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [studyTaskProgress.userId],
      references: [users.id]
    })
  })
);

export const executionPrioritiesRelations = relations(
  executionPriorities,
  ({ one }) => ({
    user: one(users, {
      fields: [executionPriorities.userId],
      references: [users.id]
    })
  })
);

export const executionProjectsRelations = relations(
  executionProjects,
  ({ many, one }) => ({
    user: one(users, {
      fields: [executionProjects.userId],
      references: [users.id]
    }),
    tasks: many(executionTasks),
    memories: many(memories),
    knowledgeLinks: many(projectKnowledgeLinks)
  })
);

export const executionTasksRelations = relations(
  executionTasks,
  ({ one }) => ({
    user: one(users, {
      fields: [executionTasks.userId],
      references: [users.id]
    }),
    project: one(executionProjects, {
      fields: [executionTasks.projectId],
      references: [executionProjects.id]
    })
  })
);

export const projectKnowledgeLinksRelations = relations(
  projectKnowledgeLinks,
  ({ one }) => ({
    user: one(users, {
      fields: [projectKnowledgeLinks.userId],
      references: [users.id]
    }),
    project: one(executionProjects, {
      fields: [projectKnowledgeLinks.projectId],
      references: [executionProjects.id]
    })
  })
);

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    mood: text("mood"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("journal_entries_user_id_idx").on(table.userId),
    index("journal_entries_created_at_idx").on(table.createdAt)
  ]
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("audit_log_user_id_idx").on(table.userId),
    index("audit_log_action_idx").on(table.action),
    index("audit_log_entity_type_idx").on(table.entityType),
    index("audit_log_created_at_idx").on(table.createdAt)
  ]
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id]
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

export const journalEntriesRelations = relations(
  journalEntries,
  ({ one }) => ({
    user: one(users, {
      fields: [journalEntries.userId],
      references: [users.id]
    })
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;
export type StudyTaskProgress = typeof studyTaskProgress.$inferSelect;
export type NewStudyTaskProgress = typeof studyTaskProgress.$inferInsert;
export type ExecutionPriority = typeof executionPriorities.$inferSelect;
export type NewExecutionPriority = typeof executionPriorities.$inferInsert;
export type ExecutionProject = typeof executionProjects.$inferSelect;
export type NewExecutionProject = typeof executionProjects.$inferInsert;
export type ExecutionTask = typeof executionTasks.$inferSelect;
export type NewExecutionTask = typeof executionTasks.$inferInsert;
export type ProjectKnowledgeLink = typeof projectKnowledgeLinks.$inferSelect;
export type NewProjectKnowledgeLink = typeof projectKnowledgeLinks.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;