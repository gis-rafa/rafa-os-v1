# RAFA OS System Overview

## Project Purpose
RAFA OS is a long-term software project. Based on the file structure and database schema, it appears to be a personal operating system or an advanced personal assistant application. It includes features for managing conversations, memories, study plans, execution priorities, projects, and knowledge links, suggesting a comprehensive system for personal organization, productivity, and knowledge management.

## Technologies
- **Next.js**: A React framework for building web applications (indicated by `next` in `package.json` and `next.config.ts`, `next-env.d.ts` files).
- **React**: A JavaScript library for building user interfaces (indicated by `react` and `react-dom` in `package.json`).
- **TypeScript**: A superset of JavaScript that adds static typing (indicated by `typescript` in `package.json` and `tsconfig.json`).
- **Drizzle ORM**: A TypeScript ORM for relational databases (indicated by `drizzle-orm` and `drizzle-kit` in `package.json`, and `drizzle.config.ts`, `src/db/schema.ts`).
- **PostgreSQL**: A relational database (indicated by `pg` in `package.json` and `dialect: "postgresql"` in `drizzle.config.ts`).
- **Clerk**: User management and authentication (indicated by `@clerk/nextjs` in `package.json`).
- **OpenAI**: Likely used for AI functionalities such as chat, memory processing, or content generation (indicated by `openai` in `package.json`).
- **Tailwind CSS**: A utility-first CSS framework (indicated by `tailwindcss` in `package.json` and `postcss.config.mjs`).
- **ESLint**: A linter for identifying and reporting on patterns in JavaScript code (indicated by `eslint` in `package.json` and `eslint.config.mjs`).
- **PNPM**: A fast, disk space efficient package manager (indicated by `pnpm-lock.yaml` and `pnpm-workspace.yaml`).

## Folder Structure
- `src/app/`: Contains the Next.js application's route handlers and UI components. It includes subdirectories for different features like `brain`, `chat`, `dashboard`, `inbox`, `journal`, `knowledge`, `memory`, `projects`, `settings`, `study-plan`, and authentication routes (`sign-in`, `sign-up`). Each feature often has its own `page.tsx` for the main UI and `actions.ts` for server-side logic.
- `src/db/`: Contains database-related files, specifically `schema.ts` which defines the database tables and their relationships.
- `drizzle/`: Contains Drizzle ORM migration files (`0000_breezy_slyde.sql`, etc.) and metadata.
- `data/`: Appears to store various data related to core functionalities, projects, knowledge, imports, and memory.
- `public/`: Contains static assets like `icon.svg` and `manifest.webmanifest`.
- `scripts/`: Holds utility scripts for development setup and database seeding.
- `docs/`: Intended for documentation, currently contains `.gitkeep`.

## Database Overview
The database schema (`src/db/schema.ts`) defines several tables:
- `users`: Stores user information, linked to Clerk for authentication.
- `conversations`: Manages chat conversations, linked to users.
- `messages`: Stores individual messages within conversations.
- `memories`: Stores user memories with categories, titles, content, tags, and importance. Can be linked to projects.
- `studyTaskProgress`: Tracks user progress on roadmap days.
- `executionPriorities`: Manages user priorities with titles and completion dates.
- `executionProjects`: Stores project details including name, description, progress, phase, status, priority, and target date.
- `projectKnowledgeLinks`: Links knowledge resources (files) to specific projects.
- `executionTasks`: Manages tasks associated with projects or users.

Relationships are defined between these tables, such as `users` having many `conversations`, `memories`, `projects`, and `tasks`.

## Architecture Summary
RAFA OS seems to follow a modern full-stack architecture:
- **Frontend**: Built with Next.js and React, likely consuming APIs or server components for data.
- **Backend/API**: Next.js API routes (e.g., `src/app/api/chat/`) handle requests, potentially interacting with the database and external services like OpenAI.
- **Database**: PostgreSQL is used as the primary data store, managed by Drizzle ORM for schema definition and migrations.
- **Authentication**: Clerk handles user authentication and management.
- **AI Integration**: OpenAI is integrated, likely for intelligent features within the application, such as natural language processing for chat or memory functions.
- **Server Components/Actions**: The presence of `actions.ts` files within `src/app` feature folders suggests the use of Next.js Server Actions for direct server-side data mutations and logic.

