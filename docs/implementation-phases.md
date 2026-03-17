# Implementation Phases

## Phase 1: Foundation (COMPLETED)

Bootable Next.js app with auth, database, basic UI shell, and project scaffolding.

### What was built

- Next.js 16 + TypeScript + Tailwind v4 project scaffold
- shadcn/ui initialized with components: Button, Input, Card, Badge, Avatar, Separator, ScrollArea
- Prisma 7 + SQLite with complete schema (9 models)
- NextAuth v5 with Google provider (restricted to single email via `ALLOWED_EMAIL`)
- Auth middleware protecting all routes
- UI shell: Header (avatar + sign out), Sidebar (topic list), landing page ("Que queres aprender?" input)
- API endpoint: `POST /api/topic` (create topics)
- Rate limiter per agent with daily limits
- Mastra instance initialization
- TypeScript types for all domain entities
- `.env.example` with all required variables

### Files created/modified

```
prisma/schema.prisma              # Full database schema
src/lib/db/client.ts               # Prisma singleton client
src/lib/auth.ts                    # NextAuth config
src/lib/rate-limiter.ts            # Per-agent rate limiting
src/middleware.ts                  # Auth middleware
src/mastra/index.ts                # Mastra instance
src/app/layout.tsx                 # App layout with auth + sidebar
src/app/page.tsx                   # Landing page
src/app/app-sidebar.tsx            # Server component sidebar
src/app/api/auth/[...nextauth]/route.ts
src/app/api/topic/route.ts
src/components/layout/Header.tsx
src/components/layout/Sidebar.tsx
src/components/layout/SessionProvider.tsx
src/types/diagnostic.ts
src/types/learning-plan.ts
src/types/content.ts
src/types/evaluation.ts
```

## Phase 2: Diagnostic Agent (TODO)

First end-to-end agent flow. User enters a topic, completes a diagnostic (Socratic or quiz), and gets a knowledge profile.

### Key tasks

- Diagnostic agent definition with Mastra (system prompt, Zod output schema)
- Knowledge profile tool (persists assessment to DB)
- Diagnostic API route with streaming (Vercel timeout constraint)
- Socratic chat UI component
- Quiz mode UI component
- Diagnostic page with mode selection
- Topic entry flow (landing → diagnostic redirect)

### Critical risk

Streaming responses to handle Vercel's 10-second function timeout. Each Socratic turn is a separate API call.

## Phase 3: Learning Plan Generation (TODO)

Knowledge profile feeds into Learning Planner agent. User sees their personalized plan.

### Key tasks

- Learning Planner agent definition
- Learning plan tool (reads profile, persists plan)
- Learning plan API route
- Plan overview UI (ordered cards with status badges)

## Phase 4: Content Generation & MDX Rendering (TODO)

The hardest phase. AI generates MDX content, rendered with interactive components.

### Key tasks

- Build all 7 predefined MDX components
- MDX component registry with Zod schemas
- MDX sanitizer and compiler/validator
- Content Generator agent definition
- MDX validator tool (agent self-check)
- Content generation API route
- Piece renderer (MDXRemote + component registry)
- Learning piece page

### Critical risk

AI output reliability — LLMs producing valid MDX with correct component props on first attempt.

## Phase 5: Evaluation & Regeneration Loop (TODO)

User submits exercises, gets graded, content regenerates on low scores.

### Key tasks

- Evaluator agent definition
- Score recorder tool (persists evaluation, triggers regen)
- Evaluation API route
- Exercise UI with score display
- Regeneration trigger (score < 5/10)
- Progress tracker component
- Evaluation workflow (Mastra)

## Phase 6: JSX Generator Agent (TODO — can be deferred)

Custom React component generation for cases where predefined components aren't enough.

### Key tasks

- JSX analyzer tool (AST blocklist/allowlist + render validation)
- JSX Generator agent with QA loop
- JSX generation API route (rate-limited: 5/day)
- Dynamic component renderer with error boundary

### Critical risk

Security surface area of arbitrary code generation. Can be deferred without impacting core functionality.

## Phase 7: Polish & Dashboard (TODO)

Complete user experience with progress tracking and quality-of-life improvements.

### Key tasks

- Dashboard page (progress, scores, API usage)
- Topic history and revisiting
- Comprehensive error handling
- Mobile responsiveness

## Critical Path

```
Phase 1 (done) → Phase 2 → Phase 3 → Phase 4 → Phase 5
                                                    ↓
                                              Core complete
                                                    ↓
                                        Phase 6 (optional) → Phase 7
```

Phase 6 can be deferred or cut entirely. The platform is fully functional with only predefined components.
