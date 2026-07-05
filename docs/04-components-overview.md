# Components Overview

This document outlines the UI components, shared layouts, and component types within RAFA OS.

## Reusable UI Components

- `app-header.tsx`: Provides a consistent header across the application with navigation, search, notifications, and user menu.
- `app-sidebar.tsx`: Implements the main navigation sidebar with links to all major pages.
- `app-shell.tsx`: Defines the overall application layout, integrating header, sidebar, and main content.
- `ui/button.tsx`: Reusable button component with variant and size props.

## Page-Level Components

- `dashboard.tsx`: Mission-focused dashboard with Today's Mission, Morning Brief, Execution Queue, Mission Progress, Focus Mode, and recovery warnings. Handles task status updates with optimistic UI.
- `brain-editor.tsx`: Editor view for the Master Brain document with section-based textareas and save/cancel actions.
- `brain-page.tsx`: Read-only view of Master Brain sections with ordered list rendering.
- `chat-interface.tsx`: Full chat UI with streaming responses, memory suggestions, developer panel, and copy/save-to-memory actions.
- `page-placeholder.tsx`: Generic placeholder used for unimplemented pages.
- `service-worker-register.tsx`: Registers the service worker for offline support.

## UI Patterns (Implemented Inline)

Instead of separate Card, Dialog, Form, or Table components, these patterns are implemented inline within each page using consistent Tailwind CSS classes:

- **Cards**: Rounded bordered containers with shadow (used in dashboard, projects, memory, journal)
- **Forms**: Inline form elements with consistent styling (used in memory, projects, journal, settings)
- **Status badges**: Inline styled spans for task/project status indicators
- **Progress bars**: Inline div-based progress bars (used in dashboard, projects)
- **Metric/stat cards**: Grid-based stat displays (used in study-plan, dashboard, projects)

## Component Responsibilities

- `app-header.tsx`: Displays global actions (menu toggle, search, notifications, user menu).
- `app-sidebar.tsx`: Renders navigation links for all app routes.
- `app-shell.tsx`: Top-level layout orchestrating header, sidebar, and content area.
- `brain-editor.tsx`: Edits Master Brain document sections.
- `brain-page.tsx`: Displays Master Brain sections in a read-only grid.
- `chat-interface.tsx`: Manages chat messages, streaming, memory suggestions, and developer tools.
- `dashboard.tsx`: Aggregates mission data, task queue, focus mode, and progress tracking.
- `page-placeholder.tsx`: Placeholder for pages not yet implemented.
