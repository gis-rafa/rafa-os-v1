# TECHNICAL ARCHITECTURE

## Frontend
Next.js, because it keeps the app, routing, API integration, and future deployment path simple while scaling cleanly if RAFA OS grows.

## Backend
Next.js API routes, because V1 does not need a separate backend service and can keep product logic close to the interface.

## Database
PostgreSQL, because it is low-cost, reliable, widely supported, and strong enough for structured personal data, projects, memory, and future analytics.

## AI Layer
OpenAI API, because it provides production-grade language models, tool use, structured outputs, and a straightforward upgrade path.

## Memory Layer
pgvector, because it adds semantic memory search directly inside PostgreSQL without introducing a separate vector database.

## Knowledge Layer
Markdown files, because V1 needs human-readable, editable source-of-truth documents before it needs a complex knowledge graph.

## Authentication
Clerk, because it provides simple managed authentication with minimal setup and room to support future user access patterns.

## Deployment
Vercel, because it is the simplest production path for a Next.js application with low operational overhead and scalable hosting.

