# Application Overview

This document provides an overview of the application's architecture, routes, pages, layouts, server actions, API routes, and UI flow.

## Application Architecture

The application is built using Next.js and follows a component-based architecture. The `src/app` directory contains the core application logic, including pages, layouts, API routes, and server actions. Global styles are defined in `globals.css`.

Authentication is handled by Clerk, and a service worker is registered for offline capabilities and push notifications.

## Routes and Pages

The application defines the following routes and their corresponding pages:

- `/`: Landing page (`src/app/page.tsx`). Displays an introduction to RAFA OS and provides links to sign in/up or access the dashboard.
- `/brain`: Master Brain page (`src/app/brain/page.tsx`). Allows users to manage their master brain document.
- `/chat`: Chat interface page (`src/app/chat/page.tsx`). Provides an AI chat experience.
- `/dashboard`: User dashboard page (`src/app/dashboard/page.tsx`). The main hub for authenticated users.
- `/inbox`: Inbox page (`src/app/inbox/page.tsx`). Manages incoming tasks and notifications.
- `/journal`: Journal page (`src/app/journal/page.tsx`). For daily reflections and notes.
- `/knowledge`: Knowledge base page (`src/app/knowledge/page.tsx`). Stores and organizes user knowledge.
- `/memory`: Memory management page (`src/app/memory/page.tsx`). Manages long-term memory and context for the AI.
- `/projects`: Projects page (`src/app/projects/page.tsx`). Manages user projects.
- `/settings`: Settings page (`src/app/settings/page.tsx`). Configures application settings.
- `/sign-in`: Sign-in page (`src/app/sign-in/[[...sign-in]]/page.tsx`). Handles user authentication (Clerk).
- `/sign-up`: Sign-up page (`src/app/sign-up/[[...sign-up]]/page.tsx`). Handles user registration (Clerk).
- `/study-plan`: Study Plan page (`src/app/study-plan/page.tsx`). Manages study plans and learning objectives.

## Layouts

- `src/app/layout.tsx`: The root layout for the entire application. It sets up the basic HTML structure, includes global styles, configures metadata and viewport, and wraps the application with ClerkProvider (if configured) and AppShell.

## Server Actions

Server actions are used for handling form submissions and other data mutations directly on the server. Examples include:

- `src/app/brain/actions.ts`: Contains `saveMasterBrainAction` for saving the master brain document.
- `src/app/chat/actions.ts`: Likely contains actions related to chat interactions (e.g., sending messages).
- `src/app/dashboard/actions.ts`: Likely contains actions specific to dashboard functionalities.
- `src/app/inbox/actions.ts`: Likely contains actions for managing the inbox (e.g., marking as read).
- `src/app/memory/actions.ts`: Likely contains actions for managing memory entries.
- `src/app/projects/actions.ts`: Likely contains actions for managing projects.
- `src/app/study-plan/actions.ts`: Likely contains actions for managing study plans.

## API Routes

API routes are defined under the `src/app/api` directory and provide a way to build a backend API with Next.js.

- `src/app/api/chat/route.ts`: This API route handles chat interactions with the OpenAI API. It takes a prompt and streams the response back to the client.

## UI Flow

1.  **Initial Load:** Users land on the `/` page, which checks for Clerk configuration and user authentication.
2.  **Authentication:**
    *   If Clerk is configured and the user is not authenticated, they are prompted to sign in (`/sign-in`) or sign up (`/sign-up`).
    *   If Clerk is not configured or the user is authenticated, they are directed to the `/dashboard`.
3.  **Dashboard Access:** Authenticated users access the `/dashboard` as their main entry point.
4.  **Navigation:** From the dashboard or other pages, users can navigate to different sections of the application (e.g., `/brain`, `/chat`, `/projects`) using the `AppShell` navigation.
5.  **Data Interaction:** Users interact with server actions (e.g., saving brain documents) and API routes (e.g., chat with AI) for data persistence and dynamic content generation.
6.  **Service Worker:** The service worker (`public/sw.js`) provides enhanced offline experience and can handle push notifications, improving the overall application responsiveness and reliability.