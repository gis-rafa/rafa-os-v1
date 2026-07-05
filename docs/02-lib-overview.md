# `src/lib` Overview

The `src/lib` directory contains various modules that provide core functionalities for the RAFA AI system. These modules handle user authentication, context routing, execution dashboard data, knowledge management, memory services, and project management. They are designed to be reusable and support the overall mission of helping Rafa achieve his long-term goals.

## Modules and their Responsibilities

- `auth-user.ts`: Handles user authentication and ensures that a current database user exists for authenticated Clerk users. It creates a new user in the database if one doesn't exist or updates an existing user's information.

- `clerk-config.ts`: Provides a utility function to check if Clerk is configured in the application, primarily by checking for the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variable.

- `context-router.ts`: Manages the routing and loading of various context blocks based on the user's message. It analyzes the message for keywords to determine which context (e.g., Master Brain, Active Context, Morning Brief, Knowledge, Memory, Projects, Inbox) is relevant and constructs a comprehensive prompt for the AI system. It also generates a report on loaded and skipped context.

- `execution-dashboard.ts`: Provides the data necessary for the execution dashboard. This includes retrieving and organizing priorities, active projects, daily and weekly tasks, latest memories, and study plan summaries. It also contains logic for adapting the execution plan by rescheduling stale tasks and calculating various progress metrics like active streaks, mission completion, and remote job readiness.

- `knowledge.ts`: Manages the knowledge base of the RAFA AI system. It loads the knowledge index, provides access to the knowledge library, and selects relevant knowledge files based on user messages and predefined tags. It also includes functions for scoring knowledge files based on their relevance.

- `local-dev-user.ts`: Provides a fallback mechanism for local development when Clerk is not configured. It ensures a local development user exists in the database.

- `master-brain.ts`: Handles the core "Master Brain" document, which serves as the control plane for Rafa's identity, mission, rules, and constraints. It provides functions to read, parse, and serialize the Master Brain content, as well as extract active context fields.

- `memories.ts`: Provides services for managing user memories. This includes listing, searching, and suggesting memories based on user messages and assistant responses. It also handles the persistence of memories to the database, including merging similar memories to avoid duplicates.

- `morning-brief.ts`: Generates a daily "Morning Brief" by synthesizing information from active context fields and the study plan. This brief provides a concise summary of today's objective, GIS task, risks, and next actions to keep Rafa aligned with his mission.

- `paths.ts`: Defines core file system paths used by the application, specifically the `dataRoot` for data storage.

- `projects.ts`: Manages user projects, including listing projects with their associated statistics (completed tasks, memories, knowledge links), creating new projects, updating existing ones, and archiving/deleting projects.

- `seed-data.ts`: Contains functions for seeding development data into the database. This is used to populate the application with initial projects, priorities, tasks, memories, and knowledge links for testing and demonstration purposes.

- `study-plan.ts`: Manages the GIS study plan, including reading roadmap tasks from markdown files, tracking user progress, and calculating completion percentages. It also provides functions to update the status of study tasks.

## Services

The `src/lib` directory essentially provides a collection of services that encapsulate specific business logic and data access patterns:

- **Authentication Service**: `auth-user.ts` and `clerk-config.ts` collectively provide authentication services, managing user sessions and database synchronization.

- **Context Management Service**: `context-router.ts` and `master-brain.ts` work together to manage the AI's understanding of the current context, ensuring relevant information is always available.

- **Execution Management Service**: `execution-dashboard.ts` and `projects.ts` offer services for tracking and managing Rafa's daily and weekly execution, including tasks, projects, and priorities.

- **Knowledge Management Service**: `knowledge.ts` provides services for organizing, searching, and retrieving knowledge from the documented knowledge base.

- **Memory Service**: `memories.ts` handles the creation, retrieval, and management of user-specific memories, allowing the AI to recall past interactions and preferences.

- **Study Plan Service**: `study-plan.ts` delivers services for guiding Rafa through his GIS study roadmap, tracking progress, and suggesting next steps.

- **Data Seeding Service**: `seed-data.ts` offers utilities for populating the database with initial data for development and testing.

## Execution Engine

The core execution flow is orchestrated by `context-router.ts`, which acts as the central router for information flow within the RAFA AI system. It dynamically selects and loads relevant context modules based on the user's input, effectively guiding the AI's decision-making process. This module is responsible for constructing the final prompt that is sent to the AI, ensuring all necessary information (Master Brain, active context, morning brief, knowledge, memories, projects, etc.) is included.

## Memory Services

Memory services are primarily handled by `memories.ts`, which provides the functionality to store, retrieve, and manage user-specific memories. This includes:

- **Searching and Listing**: Functionality to search and list memories based on keywords and categories.
- **Suggestion and Merging**: The system can suggest new memories based on conversations and intelligently merge similar memories to avoid redundancy, ensuring the memory store remains clean and relevant.
- **Persistence**: Memories are persisted to the PostgreSQL database, allowing for long-term recall and personalized interactions.

## Helper Functions

Several modules within `src/lib` contain helper functions that support their main responsibilities. These are typically internal functions not directly exposed as services but are crucial for the modules' operation:

- `auth-user.ts`: Contains internal logic for finding or creating database users based on Clerk data.
- `context-router.ts`: Includes helper functions like `routeContext` for determining which context blocks to load, `loadContext` for fetching the actual content, `readRelevantMemories`, `readRelevantKnowledge`, `readMarkdownFolder`, and `readMarkdownFiles` for file system interactions and content parsing.
- `execution-dashboard.ts`: Features numerous helper functions for date manipulation (`startOfDay`, `startOfWeek`, `addDays`, `dayKey`), sorting priorities and tasks (`sortMissionPriorities`, `sortMissionTasks`), calculating progress metrics (`getProjectProgress`, `calculateRemoteJobReadiness`, `calculateMissionCompletion`, `calculateExecutionPace`, `calculateActiveStreak`), and building recovery plans (`buildRecoveryPlan`).
- `knowledge.ts`: Includes `selectTags` and `scoreKnowledgeFile` for intelligently selecting and scoring knowledge files based on user input.
- `master-brain.ts`: Provides `parseMarkdownSectionMap`, `parseMarkdownDocument`, `serializeMarkdownDocument`, and `parseLabeledFields` for handling the Master Brain markdown document structure.
- `memories.ts`: Contains `extractSearchTerms`, `buildMemoryCandidate`, `extractMemoryContent`, `inferMemoryCategory`, `inferMemoryTags`, `inferImportance`, `createSuggestionTitle`, `mergeMemoryContent`, and `similarityScore` for processing, suggesting, and managing memories.
- `morning-brief.ts`: Uses `getCurrentRoadmapTask`, `valueFor`, and `isRelevantRelationshipStatus` to help construct the daily brief.
- `projects.ts`: Includes `maxDate` for determining the latest activity date for a project.
- `seed-data.ts`: Contains helper functions like `ensureProject`, `ensurePriority`, `removeLegacySeedPriority`, `ensureTask`, `ensureMemory`, `ensureKnowledgeLink`, `startOfDay`, and `addDays` for managing the seeding process.
- `study-plan.ts`: Employs `getStudyProgress`, `parseRoadmapTasks`, `normalizeStatus`, `phaseForDay`, and `parseDateOnly` for reading, parsing, and managing study plan data.


