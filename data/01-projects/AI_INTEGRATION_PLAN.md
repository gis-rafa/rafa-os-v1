# AI INTEGRATION PLAN

## Model Selection

RAFA OS should use a strong general-purpose OpenAI model for reasoning, coaching, planning, and synthesis. A smaller, cheaper model can be used later for classification, routing, summarization, and cleanup tasks.

The default model should prioritize reliability, instruction-following, and context handling over raw speed. Model choice should remain configurable so the system can upgrade without rewriting the product.

## Prompt Construction

Prompts should be built from structured parts:

1. system rules
2. RAFA OS mission
3. decision rules
4. current user request
5. loaded context
6. response requirements

The prompt should tell the AI what role it is playing, what context it has, what boundaries apply, and what format the answer should use.

Prompt construction should avoid dumping unnecessary files into every request. The goal is useful context, not maximum context.

## Context Assembly

Context assembly should happen before the model is called.

The system should decide which sources are needed:

- `MASTER-BRAIN.md`
- Active Context
- Memory
- Knowledge
- Projects
- Inbox
- web search

The context bundle should be ordered by authority and relevance, with `MASTER-BRAIN.md` treated as the control plane.

## Memory Injection

Memory injection should provide personal context that affects the answer.

Examples:

- preferences
- goals
- decisions
- relationship context
- ADHD patterns
- health constraints
- repeated behaviors

Memory should be injected only when relevant. Each memory item should include enough metadata to show why it was retrieved, such as title, date, source, and confidence.

## Knowledge Injection

Knowledge injection should provide reusable domain understanding.

Examples:

- GIS notes
- master's material
- career research
- learning frameworks
- technical references
- personal branding strategy

Knowledge should be kept separate from memory so the AI can distinguish personal context from domain knowledge.

## Web Search Integration

Web search should be used only when freshness or external verification matters.

Examples:

- current job market information
- recent tool changes
- updated documentation
- external facts
- live opportunities

Search results should be summarized, cited, and clearly separated from RAFA OS internal context. Web search should not override `MASTER-BRAIN.md`; it should only add current external facts.

## Response Generation

The final answer should combine the user request, `MASTER-BRAIN.md`, active context, relevant memory, relevant knowledge, and web search results if used.

The answer should reduce cognitive load, make tradeoffs clear, and give concrete next actions when useful.

The AI should not pretend certainty when context is missing. If confidence is low, it should ask a focused follow-up question instead of guessing.

## Cost Optimization

RAFA OS should control cost by:

- loading only relevant context
- using smaller models for simple classification and formatting
- caching repeated context summaries
- avoiding unnecessary web searches
- summarizing long notes before injecting them
- limiting retrieved memory and knowledge items

Cost optimization should never degrade important personal decisions, privacy, or safety.

## Error Handling

The system should handle failures gracefully.

If OpenAI is unavailable, the app should explain that AI is temporarily unavailable and preserve the user's input.

If memory, knowledge, or web search fails, the AI should say what context was missing and answer only within its available confidence.

If the model output is malformed, unsafe, or incomplete, the system should retry once with a stricter instruction. If it still fails, the user should receive a clear error instead of a misleading answer.

