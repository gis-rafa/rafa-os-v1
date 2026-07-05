# Database Overview

This document provides an overview of the database architecture, including tables, schema, relationships, indexes, Drizzle ORM usage, migrations, seeding process, and data flow.

## Database Architecture

The application uses a PostgreSQL database. Drizzle ORM is used to interact with the database, providing a type-safe and efficient way to define schemas and perform queries.

## Tables and Schema

The database schema is defined in `src/db/schema.ts` and includes the following tables:

### `users`

Stores user information.

- `id`: Unique identifier for the user (UUID, primary key).
- `clerkUserId`: User ID from Clerk authentication (text, not null, unique index).
- `email`: User's email address (text).
- `name`: User's name (text).
- `imageUrl`: URL to the user's profile image (text).
- `createdAt`: Timestamp of user creation (with timezone, not null, default now).
- `updatedAt`: Timestamp of last update (with timezone, not null, default now).

### `conversations`

Stores conversation threads.

- `id`: Unique identifier for the conversation (UUID, primary key).
- `userId`: Foreign key to `users.id` (UUID, not null, cascades on delete, index).
- `title`: Title of the conversation (text, not null).
- `createdAt`: Timestamp of conversation creation (with timezone, not null, default now).
- `updatedAt`: Timestamp of last update (with timezone, not null, default now).

### `messages`

Stores messages within conversations.

- `id`: Unique identifier for the message (UUID, primary key).
- `conversationId`: Foreign key to `conversations.id` (UUID, not null, cascades on delete, index).
- `role`: Role of the message sender (text, not null, e.g., 'user', 'assistant').
- `content`: Content of the message (text, not null).
- `metadata`: Additional message metadata (jsonb).
- `createdAt`: Timestamp of message creation (with timezone, not null, default now, index).

### `memories`

Stores user memories or knowledge snippets.

- `id`: Unique identifier for the memory (UUID, primary key).
- `userId`: Foreign key to `users.id` (UUID, not null, cascades on delete, index).
- `projectId`: Foreign key to `executionProjects.id` (UUID, sets null on delete, index).
- `category`: Category of the memory (text, not null, index).
- `title`: Title of the memory (text, not null).
- `content`: Content of the memory (text, not null).
- `tags`: Array of tags associated with the memory (text[], not null, default empty array).
- `importance`: Importance level of the memory (integer, not null, default 3).
- `createdAt`: Timestamp of memory creation (with timezone, not null, default now, index).
- `updatedAt`: Timestamp of last update (with timezone, not null, default now).

### `study_task_progress`

Tracks user's progress on study tasks.

- `id`: Unique identifier for the progress entry (UUID, primary key).
- `userId`: Foreign key to `users.id` (UUID, not null, cascades on delete, index).
- `roadmapDay`: Day in the study roadmap (integer, not null, unique index with `userId`).
- `status`: Status of the task (text, not null, default 'Todo', index).
- `createdAt`: Timestamp of creation (with timezone, not null, default now).
- `updatedAt`: Timestamp of last update (with timezone, not null, default now).

### `execution_priorities`

Manages user's execution priorities.

- `id`: Unique identifier for the priority entry (UUID, primary key).
- `userId`: Foreign key to `users.id` (UUID, not null, cascades on delete, index).
- `title`: Title of the priority (text, not null).
- `priorityDate`: Date of the priority (with timezone, not null, default now, index).
- `completedAt`: Timestamp when the priority was completed (with timezone).
- `createdAt`: Timestamp of creation (with timezone, not null, default now).
- `updatedAt`: Timestamp of last update (with timezone, not null, default now).

### `execution_projects`

Manages user's projects.

- `id`: Unique identifier for the project (UUID, primary key).
- `userId`: Foreign key to `users.id` (UUID, not null, cascades on delete, index).
- `name`: Name of the project (text, not null).
- `description`: Description of the project (text, not null, default empty string).
- `progress`: Progress percentage of the project (integer, not null, default 0).
- `currentPhase`: Current phase of the project (text, not null, default 'Planning').
- `status`: Status of the project (text, not null, default 'Active', index with `userId`).
- `priority`: Priority of the project (text, not null, default 'Medium', index).
- `targetDate`: Target completion date (with timezone, index).
- `color`: Color associated with the project (text, not null, default 'stone').
- `icon`: Icon associated with the project (text, not null, default 'folder').
- `createdAt`: Timestamp of creation (with timezone, not null, default now).
- `updatedAt`: Timestamp of last update (with timezone, not null, default now, index).

### `project_knowledge_links`

Stores links to knowledge related to projects.

- `id`: Unique identifier (UUID, primary key).
- `userId`: Foreign key to `users.id` (UUID, not null, cascades on delete, index).
- `projectId`: Foreign key to `executionProjects.id` (UUID, not null, cascades on delete, unique index with `filePath`, index).
- `filePath`: Path to the knowledge file (text, not null).
- `title`: Title of the knowledge link (text, not null).
- `tags`: Array of tags (text[], not null, default empty array).
- `createdAt`: Timestamp of creation (with timezone, not null, default now).
- `updatedAt`: Timestamp of last update (with timezone, not null, default now).

### `execution_tasks`

Manages individual tasks within projects or for users.

- `id`: Unique identifier for the task (UUID, primary key).
- `userId`: Foreign key to `users.id` (UUID, not null, cascades on delete, index).
- `projectId`: Foreign key to `executionProjects.id` (UUID, sets null on delete, index).
- `title`: Title of the task (text, not null).
- `taskDate`: Date for the task (with timezone, not null, default now, index with `userId`).
- `status`: Status of the task (text, not null, default 'Todo', index).
- `priority`: Priority of the task (text, not null, default 'Medium').
- `estimatedMinutes`: Estimated minutes to complete the task (integer, not null, default 30).
- `completedAt`: Timestamp when the task was completed (with timezone).
- `createdAt`: Timestamp of creation (with timezone, not null, default now).
- `updatedAt`: Timestamp of last update (with timezone, not null, default now).

## Relationships

- **User to Conversations:** One-to-many. A user can have multiple conversations.
- **User to Memories:** One-to-many. A user can have multiple memories.
- **User to StudyTaskProgress:** One-to-many. A user can have multiple study task progress entries.
- **User to ExecutionPriorities:** One-to-many. A user can have multiple execution priorities.
- **User to ExecutionProjects:** One-to-many. A user can have multiple execution projects.
- **User to ProjectKnowledgeLinks:** One-to-many. A user can have multiple project knowledge links.
- **User to ExecutionTasks:** One-to-many. A user can have multiple execution tasks.
- **Conversation to Messages:** One-to-many. A conversation can have multiple messages.
- **Memory to Project:** Many-to-one. A memory can belong to one project.
- **Project to Tasks:** One-to-many. A project can have multiple tasks.
- **Project to Memories:** One-to-many. A project can have multiple memories.
- **Project to Knowledge Links:** One-to-many. A project can have multiple knowledge links.

## Indexes

Indexes are defined to improve query performance:

- `users_clerk_user_id_idx`: Unique index on `clerkUserId` in `users` table.
- `conversations_user_id_idx`: Index on `userId` in `conversations` table.
- `memories_user_id_idx`: Index on `userId` in `memories` table.
- `memories_project_id_idx`: Index on `projectId` in `memories` table.
- `memories_category_idx`: Index on `category` in `memories` table.
- `memories_created_at_idx`: Index on `createdAt` in `memories` table.
- `messages_conversation_id_idx`: Index on `conversationId` in `messages` table.
- `messages_created_at_idx`: Index on `createdAt` in `messages` table.
- `study_task_progress_user_day_idx`: Unique index on `userId` and `roadmapDay` in `study_task_progress` table.
- `study_task_progress_user_id_idx`: Index on `userId` in `study_task_progress` table.
- `study_task_progress_status_idx`: Index on `status` in `study_task_progress` table.
- `execution_priorities_user_date_idx`: Index on `userId` and `priorityDate` in `execution_priorities` table.
- `execution_priorities_completed_at_idx`: Index on `completedAt` in `execution_priorities` table.
- `execution_projects_user_status_idx`: Index on `userId` and `status` in `execution_projects` table.
- `execution_projects_priority_idx`: Index on `priority` in `execution_projects` table.
- `execution_projects_target_date_idx`: Index on `targetDate` in `execution_projects` table.
- `execution_projects_updated_at_idx`: Index on `updatedAt` in `execution_projects` table.
- `project_knowledge_links_project_file_idx`: Unique index on `projectId` and `filePath` in `project_knowledge_links` table.
- `project_knowledge_links_user_id_idx`: Index on `userId` in `project_knowledge_links` table.
- `project_knowledge_links_project_id_idx`: Index on `projectId` in `project_knowledge_links` table.
- `execution_tasks_user_date_idx`: Index on `userId` and `taskDate` in `execution_tasks` table.
- `execution_tasks_status_idx`: Index on `status` in `execution_tasks` table.
- `execution_tasks_project_id_idx`: Index on `projectId` in `execution_tasks` table.

## Drizzle ORM Usage

Drizzle ORM is used to define the database schema, perform migrations, and interact with the database. The `drizzle.config.ts` file configures Drizzle Kit, specifying the schema file (`./src/db/schema.ts`), output directory for migrations (`./drizzle`), and database dialect (`postgresql`).

## Migrations

Drizzle Kit is used to generate and apply database migrations. The migration files are located in the `drizzle/` directory (e.g., `drizzle/0000_breezy_slyde.sql`). These SQL files capture the changes to the database schema over time.

## Seeding Process

The seeding process populates the database with initial data, often for development or testing purposes. This usually involves running scripts that insert predefined data into the tables. (Further details on specific seeding scripts can be found in `scripts/seed-development.mjs` if available).

## Data Flow Between Database and Application

1.  **Application Request:** The application (e.g., via API endpoints or services) initiates a request for data or to perform an action.
2.  **Drizzle ORM:** Drizzle ORM translates application-level data operations into SQL queries.
3.  **Database Client:** A PostgreSQL client (e.g., `pg` pool as configured in `src/db/client.ts`) connects to the database.
4.  **Database Interaction:** The SQL queries are executed against the PostgreSQL database.
5.  **Data Retrieval/Modification:** The database processes the queries, retrieves or modifies data, and returns the results.
6.  **Drizzle ORM (Result Mapping):** Drizzle ORM maps the raw database results back into type-safe JavaScript/TypeScript objects.
7.  **Application Response:** The application receives the processed data and responds to the user or continues its internal logic.
