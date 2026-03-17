# Architectural Decisions

This document records key technical decisions and their rationale.

## ADR-001: SQLite over PostgreSQL

**Decision:** Use SQLite (via Prisma + @prisma/adapter-libsql) instead of PostgreSQL/Supabase.

**Rationale:** Single-tenant personal use. SQLite is simpler, has zero infrastructure cost, and requires no external database service. Turso provides a hosted SQLite option with a generous free tier if we need to move away from file-based storage for Vercel deployment.

**Trade-off:** No concurrent write support, no full-text search, no complex joins at scale. None of these matter for single-tenant use.

## ADR-002: Prisma over Drizzle

**Decision:** Use Prisma 7 as the ORM.

**Rationale:** User preference. Prisma provides a mature migration system, type-safe client, and Prisma Studio for debugging.

## ADR-003: Predefined Components with Data Props over Raw HTML Generation

**Decision:** AI agents generate structured JSON data that fills predefined React components, rather than generating raw HTML/SVG/JSX.

**Rationale:** Asking an LLM to generate raw rendering code is error-prone. By constraining the agent to output data (nodes, edges, quiz questions), we get reliable rendering from battle-tested components. This dramatically improves content generation success rate.

**Trade-off:** Less visual variety. Mitigated by the JSX Generator agent (Phase 6) for cases where predefined components aren't sufficient.

## ADR-004: next-mdx-remote over @next/mdx

**Decision:** Use `next-mdx-remote` (specifically `next-mdx-remote/rsc`) for MDX rendering.

**Rationale:** `@next/mdx` is designed for build-time MDX files. We need runtime compilation of AI-generated MDX strings. `next-mdx-remote` specifically supports this use case and is RSC-compatible.

## ADR-005: Streaming Responses for AI Calls

**Decision:** All AI agent API endpoints use streaming responses.

**Rationale:** Vercel free tier has a 10-second function execution limit. AI agent calls can exceed this. Streaming keeps the connection alive and returns partial results as they're generated.

## ADR-006: Content Versioning with Archive

**Decision:** Never delete content. When regeneration is triggered, archive the previous version and create a new one.

**Rationale:** Provides an audit trail of what content approaches worked vs. failed. Enables future analysis. The `ContentVersion` model tracks version number, active status, and generation reason.

## ADR-007: Evaluation Threshold of 5/10

**Decision:** Fixed threshold of 5/10 for triggering content regeneration.

**Rationale:** Simple and predictable. A configurable per-topic threshold adds complexity without clear benefit for an MVP. Can be revisited later.

## ADR-008: JSX Generator as a Deferrable Feature

**Decision:** The JSX Generator agent (Phase 6) can be deferred or cut without impacting core functionality.

**Rationale:** The security and reliability risks of arbitrary code generation are significant. The platform is fully functional with only predefined components. The JSX Generator is a power feature that adds visual variety but isn't required for the core learning loop.

## ADR-009: Mastra for Agent Orchestration

**Decision:** Use the Mastra framework for AI agent definitions and workflows.

**Rationale:** Mastra provides structured agent definitions, tool integration, workflow orchestration, and structured output validation. The team has prior experience with Mastra.

**Risk:** Mastra is relatively new. Pin exact versions and isolate Mastra-specific code so it can be swapped if needed.

## ADR-010: Single-Tenant Auth

**Decision:** Restrict authentication to a single Google email address.

**Rationale:** MVP is for personal use only. Adding multi-tenant support (user management, data isolation, billing) would significantly increase scope without delivering value for the initial use case.
