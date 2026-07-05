# Backend Flow Documentation

## 1. API Endpoints

### `/api/chat`
- **Method:** `POST`
- **Description:** Handles chat requests, sending prompts to the OpenAI API and streaming responses back to the client.
- **Request Flow:**
  - Client sends `POST` to `/api/chat` with JSON body containing `prompt`.
  - Server extracts `prompt` from request body.
  - **Validation:** Checks `OPENAI_API_KEY` is set (500 if missing), checks `prompt` is non-empty (400 if missing).
  - **AI Interactions:** Initializes OpenAI client, creates a streaming response with configured model.
  - **Response Flow:** Streams OpenAI responses back with `Content-Type: text/plain; charset=utf-8` and `Cache-Control: no-cache`.
  - **Error Handling:** Catches OpenAI errors (`response.output_text.delta`, `error`, `response.failed`), encodes error messages into the stream, and a generic `try-catch` for unexpected errors.

## 2. Server Actions

Server actions are implemented in `src/app/**/actions.ts` files. All major pages have corresponding action files:

| Page | Actions File | Key Functions |
|------|-------------|---------------|
| Brain | `brain/actions.ts` | `saveMasterBrainAction` |
| Chat | `chat/actions.ts` | `buildChatPromptAction`, `saveAssistantMemoryAction`, `suggestMemoryAction`, `saveMemorySuggestionAction` |
| Dashboard | `dashboard/actions.ts` | `updatePriorityCompletionAction`, `updateExecutionTaskStatusAction` |
| Inbox | `inbox/actions.ts` | `saveInboxEntryAction` |
| Journal | `journal/actions.ts` | `createJournalEntryAction`, `updateJournalEntryAction`, `deleteJournalEntryAction` |
| Knowledge | `knowledge/actions.ts` | `createKnowledgeFileAction` |
| Memory | `memory/actions.ts` | `createMemoryAction`, `updateMemoryAction`, `deleteMemoryAction` |
| Notifications | `notifications/actions.ts` | `createNotificationAction`, `getNotificationsAction`, `markNotificationReadAction`, `markAllNotificationsReadAction`, `deleteNotificationAction` |
| Projects | `projects/actions.ts` | `createProjectAction`, `updateProjectAction`, `archiveProjectAction`, `deleteProjectAction` |
| Settings | `settings/actions.ts` | `updateProfileAction` |
| Study Plan | `study-plan/actions.ts` | `updateStudyTaskStatusAction` |

All server actions follow the same pattern:
1. Resolve the current user (Clerk auth or local development fallback)
2. Validate form data
3. Execute database operation via the corresponding lib module
4. Revalidate affected paths
5. Redirect or return result

## 3. Authentication Flow

- Two modes: Clerk (production) and local development fallback.
- `isClerkConfigured()` checks for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Local mode uses `canUseLocalDatabaseFallback()` which checks for `DATABASE_URL` without Clerk.
- Middleware (`proxy.ts`) protects all routes except `/`, `/sign-in`, `/sign-up` when Clerk is configured.
- `/api/chat` relies on `OPENAI_API_KEY` for OpenAI authentication; no user auth at the API layer.

## 4. Server Action Authentication Pattern

```typescript
async function getActionUser() {
  if (isClerkConfigured()) {
    return requireCurrentDbUser();
  }
  if (canUseLocalDatabaseFallback()) {
    return getLocalDevelopmentUser();
  }
  throw new Error("Authentication is required.");
}
```

This pattern is reused across all action files to support both auth modes.

## 5. Database Interactions

- `getDb()` returns a singleton Drizzle ORM instance connected to PostgreSQL via `pg` pool.
- Schema is defined in `src/db/schema.ts` with 11 tables (users, conversations, messages, memories, studyTaskProgress, executionPriorities, executionProjects, executionTasks, projectKnowledgeLinks, notifications, journalEntries).
- Each lib module wraps database operations for its domain.
- `/api/chat` is the only non-DB endpoint; it proxies to OpenAI without DB interaction.

## 6. AI Interactions

- **Context Routing** (`lib/context-router.ts`): Builds AI prompts by loading Master Brain, Active Context, Morning Brief, Knowledge Index, and optionally Inbox, Projects, Knowledge, and Memory based on message keywords.
- **Memory Suggestion** (`lib/memories.ts`): After each assistant response, analyzes the conversation for durable information and suggests saving it as a memory.
- **Chat API** (`api/chat/route.ts`): Streams responses from OpenAI's responses API.
- **Morning Brief** (`lib/morning-brief.ts`): Generates daily briefs from Active Context and Study Plan data.

## 7. Error Handling

- **API Endpoint (`/api/chat`):**
  - Missing `OPENAI_API_KEY` returns 500.
  - Missing `prompt` returns 400.
  - OpenAI errors are streamed back to the client.
- **Client-side** (`lib/error-handling.ts`):
  - `handleClientError()`: Logs and shows toast notifications.
  - `handleServerError()`: Logs server errors with client feedback.
- **Server Actions**: Validation throws descriptive errors; revalidation on success.
- **Database**: Pool connection errors propagate; individual queries handle not-found cases with null returns.