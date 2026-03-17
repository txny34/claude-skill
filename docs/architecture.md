# Architecture

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| AI Agents | Mastra framework |
| Database | SQLite via Prisma 7 + @prisma/adapter-libsql |
| Auth | NextAuth v5 (Google provider, single email) |
| Content Rendering | MDX via next-mdx-remote |
| Deployment | Vercel (free tier) |

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Auth endpoints
│   │   ├── topic/                # Topic CRUD
│   │   ├── diagnostic/           # Diagnostic agent endpoint
│   │   ├── learning-plan/        # Plan generation endpoint
│   │   ├── content/              # Content generation endpoint
│   │   ├── evaluate/             # Exercise evaluation endpoint
│   │   └── jsx-generate/         # JSX generation endpoint
│   ├── learn/[topicId]/          # Learning pages
│   └── dashboard/                # Progress overview
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── mdx/                      # Predefined MDX components
│   ├── diagnostic/               # Diagnostic UI
│   ├── learning/                 # Learning UI
│   └── layout/                   # App shell (Header, Sidebar)
├── lib/
│   ├── db/                       # Prisma client
│   ├── mdx/                      # MDX compilation pipeline
│   ├── auth.ts                   # NextAuth config
│   └── rate-limiter.ts           # Per-agent rate limiting
├── mastra/
│   ├── agents/                   # Agent definitions
│   ├── tools/                    # Mastra tools
│   └── workflows/                # Multi-agent workflows
├── types/                        # TypeScript type definitions
└── generated/prisma/             # Prisma generated client
```

## Database Schema

See `prisma/schema.prisma` for the full schema. Key models:

- **Topic** — A learning topic entered by the user
- **DiagnosticSession** — Conversation or quiz data from the diagnostic phase
- **KnowledgeProfile** — Assessed level, strengths, weaknesses, misconceptions
- **LearningPlan** — Ordered set of learning pieces for a topic
- **LearningPiece** — Individual unit of learning within a plan
- **ContentVersion** — Versioned MDX content for a piece (supports audit trail)
- **Exercise** — Exercises attached to content versions
- **Evaluation** — Graded exercise submissions with scores
- **RateLimitLog** — Tracks AI agent API usage for cost control

## Auth Model

Single-tenant. Only one Google email address (configured via `ALLOWED_EMAIL` env var) can sign in. All routes except `/api/auth/*` are protected by middleware.

## Deployment Constraints (Vercel Free Tier)

- **10-second function timeout**: All AI agent calls must use streaming responses
- **No background jobs**: Multi-step workflows must be broken into separate API calls
- **100GB bandwidth / 100GB-hours compute**: Sufficient for single-tenant use
