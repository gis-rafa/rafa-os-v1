# MVP Execution Plan

This document outlines a detailed execution plan for achieving the Minimum Viable Product (MVP) of the RAFA OS, breaking down features into small, manageable tasks with complexity estimates, dependencies, and recommended build order.

## 1. MVP Features and Implementation Tasks

Based on the MVP definition in `docs/08-development-roadmap.md`, the core features required are:

### Feature 1: Master Brain Management
**Goal:** Enable Rafa to define his core identity and mission.

*   **Task 1.1: Master Brain Read/Parse Logic (Backend)**
    *   Description: Ensure `master-brain.ts` can reliably read and parse `MASTER-BRAIN.md`.
    *   Complexity: Small
    *   Dependencies: None
    *   Independent: Yes

*   **Task 1.2: Master Brain Save Logic (Backend)**
    *   Description: Implement or verify `saveMasterBrainDocument` in `master-brain.ts` and `saveMasterBrainAction` in `src/app/brain/actions.ts` for persisting changes.
    *   Complexity: Medium
    *   Dependencies: Task 1.1
    *   Independent: No

*   **Task 1.3: Master Brain Editor UI (Frontend)**
    *   Description: Develop the `brain-editor.tsx` component to display and allow editing of the Master Brain content.
    *   Complexity: Medium
    *   Dependencies: Task 1.2
    *   Independent: No

*   **Task 1.4: Master Brain Page Integration (Frontend)**
    *   Description: Integrate `brain-editor.tsx` into `src/app/brain/page.tsx` and connect it with server actions.
    *   Complexity: Small
    *   Dependencies: Task 1.3
    *   Independent: No

### Feature 2: AI Chat Interface
**Goal:** Enable Rafa to interact with an AI assistant.

*   **Task 2.1: OpenAI API Integration (Backend)**
    *   Description: Ensure `src/app/api/chat/route.ts` correctly communicates with the OpenAI API for streaming responses.
    *   Complexity: Small
    *   Dependencies: None
    *   Independent: Yes

*   **Task 2.2: Chat UI Component (Frontend)**
    *   Description: Develop `chat-interface.tsx` for displaying chat messages and inputting prompts.
    *   Complexity: Medium
    *   Dependencies: Task 2.1
    *   Independent: No

*   **Task 2.3: Chat Page Integration (Frontend)**
    *   Description: Integrate `chat-interface.tsx` into `src/app/chat/page.tsx`.
    *   Complexity: Small
    *   Dependencies: Task 2.2
    *   Independent: No

*   **Task 2.4: Context Routing Integration (Backend)**
    *   Description: Ensure `context-router.ts` is called by the chat API to build comprehensive AI prompts based on user input, loading Master Brain, Active Context, Morning Brief, Memories, Knowledge, and Projects.
    *   Complexity: Large
    *   Dependencies: Task 1.1, Task 5.1, Task 6.1, Task 7.1, Task 8.1, Task 9.1
    *   Independent: No

### Feature 3: Study Plan Tracking
**Goal:** Enable Rafa to track his study progress for the GIS roadmap.

*   **Task 3.1: Read Roadmap Tasks Logic (Backend)**
    *   Description: Verify `readRoadmapTasks` in `study-plan.ts` correctly parses study roadmap Markdown files.
    *   Complexity: Small
    *   Dependencies: None
    *   Independent: Yes

*   **Task 3.2: Study Progress Update Logic (Backend)**
    *   Description: Implement or verify `updateStudyTaskStatus` in `study-plan.ts` and corresponding server actions in `src/app/study-plan/actions.ts`.
    *   Complexity: Medium
    *   Dependencies: Task 3.1
    *   Independent: No

*   **Task 3.3: Study Plan UI (Frontend)**
    *   Description: Develop an interactive UI in `src/app/study-plan/page.tsx` to display roadmap tasks and allow status updates.
    *   Complexity: Medium
    *   Dependencies: Task 3.2
    *   Independent: No

### Feature 4: Project and Task Management
**Goal:** Enable Rafa to manage his active projects and tasks with basic CRUD operations.

*   **Task 4.1: Project List & Detail Services (Backend)**
    *   Description: Ensure `listProjectsWithStats` and `getProjectForUser` in `projects.ts` are functional.
    *   Complexity: Small
    *   Dependencies: None
    *   Independent: Yes

*   **Task 4.2: Project CRUD Operations (Backend)**
    *   Description: Implement `createProject`, `updateProject`, `archiveProject`, `deleteProject` in `projects.ts` and corresponding server actions in `src/app/projects/actions.ts`.
    *   Complexity: Medium
    *   Dependencies: Task 4.1
    *   Independent: No

*   **Task 4.3: Task CRUD Operations (Backend)**
    *   Description: Implement CRUD for tasks within `execution-dashboard.ts` (or a dedicated task service) and corresponding server actions for `src/app/projects/actions.ts`.
    *   Complexity: Medium
    *   Dependencies: Task 4.2
    *   Independent: No

*   **Task 4.4: Projects List UI (Frontend)**
    *   Description: Develop a UI in `src/app/projects/page.tsx` to list projects with basic stats and allow creation/deletion.
    *   Complexity: Medium
    *   Dependencies: Task 4.2
    *   Independent: No

*   **Task 4.5: Project Detail & Task List UI (Frontend)**
    *   Description: Develop a UI for individual project pages, showing details and a list of associated tasks, with options to add/edit/complete tasks.
    *   Complexity: Large
    *   Dependencies: Task 4.3, Task 4.4
    *   Independent: No

### Feature 5: Memory Storage and Retrieval
**Goal:** Enable Rafa to store and retrieve personal memories.

*   **Task 5.1: Memory CRUD Services (Backend)**
    *   Description: Ensure `listMemories`, `getMemoryForUser`, and `saveMemorySuggestion` (for new memories) in `memories.ts` and `src/app/memory/actions.ts` are functional.
    *   Complexity: Medium
    *   Dependencies: None
    *   Independent: Yes

*   **Task 5.2: Memory Search & Suggestion Logic (Backend)**
    *   Description: Refine `searchRelevantMemoriesForMessage` and `suggestMemoryFromConversation` in `memories.ts` for effective retrieval and suggestion.
    *   Complexity: Medium
    *   Dependencies: Task 5.1
    *   Independent: No

*   **Task 5.3: Memory UI (Frontend)**
    *   Description: Develop a UI in `src/app/memory/page.tsx` to list, search, view, and add/edit memories.
    *   Complexity: Medium
    *   Dependencies: Task 5.1
    *   Independent: No

### Feature 6: Knowledge Base Access
**Goal:** Enable Rafa to access a knowledge base for relevant information.

*   **Task 6.1: Knowledge Read/Select Services (Backend)**
    *   Description: Verify `loadKnowledgeIndex`, `getKnowledgeLibrary`, and `selectKnowledgeForMessage` in `knowledge.ts` are functional.
    *   Complexity: Small
    *   Dependencies: None
    *   Independent: Yes

*   **Task 6.2: Knowledge Browse/Search UI (Frontend)**
    *   Description: Develop a UI in `src/app/knowledge/page.tsx` to browse and search knowledge files.
    *   Complexity: Medium
    *   Dependencies: Task 6.1
    *   Independent: No

### Feature 7: Daily Morning Brief
**Goal:** Enable Rafa to receive a daily morning brief.

*   **Task 7.1: Morning Brief Generation Logic (Backend)**
    *   Description: Ensure `generateMorningBrief` in `morning-brief.ts` correctly synthesizes information from Active Context and Study Plan.
    *   Complexity: Medium
    *   Dependencies: Task 1.1, Task 3.1
    *   Independent: No

*   **Task 7.2: Morning Brief UI Integration (Frontend)**
    *   Description: Display the generated morning brief prominently on the `/dashboard` page.
    *   Complexity: Small
    *   Dependencies: Task 7.1, Task 9.2
    *   Independent: No

### Feature 8: Core UI & Navigation
**Goal:** Ensure a usable and navigable application structure.

*   **Task 8.1: AppShell, Header, Sidebar (Frontend)**
    *   Description: Ensure `app-shell.tsx`, `app-header.tsx`, and `app-sidebar.tsx` provide robust navigation and layout.
    *   Complexity: Small
    *   Dependencies: None
    *   Independent: Yes

*   **Task 8.2: Landing Page & Auth Flow (Frontend)**
    *   Description: Verify `/` page handles authentication redirects correctly and `sign-in`/`sign-up` pages are functional.
    *   Complexity: Small
    *   Dependencies: Task 8.1
    *   Independent: No

### Feature 9: Execution Dashboard
**Goal:** Provide an overview of Rafa's progress, priorities, and current status.

*   **Task 9.1: Dashboard Data Services (Backend)**
    *   Description: Ensure `getExecutionDashboardData` in `execution-dashboard.ts` aggregates data from various sources correctly.
    *   Complexity: Medium
    *   Dependencies: Task 3.1, Task 4.1
    *   Independent: No

*   **Task 9.2: Dashboard UI (Frontend)**
    *   Description: Develop a rich UI for `src/app/dashboard/page.tsx` displaying key metrics, priorities, projects, and study plan summaries.
    *   Complexity: Large
    *   Dependencies: Task 9.1, Task 7.2
    *   Independent: No

## 2. Dependencies and Recommended Build Order

This order prioritizes foundational backend services, followed by their corresponding UI components, and addresses dependencies logically. Independent tasks can be worked on in parallel once their prerequisites are met.

### Milestone 1: Core Backend & Basic UI Foundations

1.  **Task 1.1: Master Brain Read/Parse Logic (Backend)** (Small, Independent)
2.  **Task 3.1: Read Roadmap Tasks Logic (Backend)** (Small, Independent)
3.  **Task 4.1: Project List & Detail Services (Backend)** (Small, Independent)
4.  **Task 5.1: Memory CRUD Services (Backend)** (Medium, Independent)
5.  **Task 6.1: Knowledge Read/Select Services (Backend)** (Small, Independent)
6.  **Task 8.1: AppShell, Header, Sidebar (Frontend)** (Small, Independent)

### Milestone 2: Core Data Management & Initial AI Interaction

7.  **Task 1.2: Master Brain Save Logic (Backend)** (Medium, Depends: 1.1)
8.  **Task 3.2: Study Progress Update Logic (Backend)** (Medium, Depends: 3.1)
9.  **Task 4.2: Project CRUD Operations (Backend)** (Medium, Depends: 4.1)
10. **Task 4.3: Task CRUD Operations (Backend)** (Medium, Depends: 4.2)
11. **Task 5.2: Memory Search & Suggestion Logic (Backend)** (Medium, Depends: 5.1)
12. **Task 7.1: Morning Brief Generation Logic (Backend)** (Medium, Depends: 1.1, 3.1)
13. **Task 9.1: Dashboard Data Services (Backend)** (Medium, Depends: 3.1, 4.1)
14. **Task 2.1: OpenAI API Integration (Backend)** (Small, Independent)

### Milestone 3: Functional Pages & AI Contextualization

15. **Task 1.3: Master Brain Editor UI (Frontend)** (Medium, Depends: 1.2)
16. **Task 1.4: Master Brain Page Integration (Frontend)** (Small, Depends: 1.3)
17. **Task 3.3: Study Plan UI (Frontend)** (Medium, Depends: 3.2)
18. **Task 4.4: Projects List UI (Frontend)** (Medium, Depends: 4.2)
19. **Task 5.3: Memory UI (Frontend)** (Medium, Depends: 5.1)
20. **Task 6.2: Knowledge Browse/Search UI (Frontend)** (Medium, Depends: 6.1)
21. **Task 8.2: Landing Page & Auth Flow (Frontend)** (Small, Depends: 8.1)
22. **Task 2.2: Chat UI Component (Frontend)** (Medium, Depends: 2.1)
23. **Task 2.3: Chat Page Integration (Frontend)** (Small, Depends: 2.2)

### Milestone 4: Integrated Dashboard & Full AI Context

24. **Task 7.2: Morning Brief UI Integration (Frontend)** (Small, Depends: 7.1, 9.2 - *Note: 9.2 will be mostly completed with 9.1 before 7.2, so it's a soft dependency here*)
25. **Task 9.2: Dashboard UI (Frontend)** (Large, Depends: 9.1, 7.2)
26. **Task 4.5: Project Detail & Task List UI (Frontend)** (Large, Depends: 4.3, 4.4)
27. **Task 2.4: Context Routing Integration (Backend)** (Large, Depends: 1.1, 5.1, 6.1, 7.1, 8.1, 9.1 - *Note: This task is placed later to ensure all core data services it depends on are stable, but its integration will significantly enhance AI capabilities*)

## 3. First Coding Milestone Definition

The first coding milestone will be the completion of **Milestone 1: Core Backend & Basic UI Foundations**. This includes:

*   **Master Brain Read/Parse Logic (Backend)**
*   **Read Roadmap Tasks Logic (Backend)**
*   **Project List & Detail Services (Backend)**
*   **Memory CRUD Services (Backend)**
*   **Knowledge Read/Select Services (Backend)**
*   **AppShell, Header, Sidebar (Frontend)**

Upon completion of this milestone, the application will have a functional base for its core data services and a consistent UI layout, allowing for independent progress on several key areas.