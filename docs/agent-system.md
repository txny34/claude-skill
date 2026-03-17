# Agent System

SkillForge uses 5 specialized AI agents orchestrated through the [Mastra](https://mastra.ai) framework. Each agent has a single responsibility and communicates with others through persisted data in the database.

## Agents

### 1. Diagnostic Agent

**Purpose:** Assess the user's current knowledge level on a topic.

**Modes:**
- **Socratic interview** — Multi-turn conversational assessment. The agent asks probing questions, follows up on vague answers, and challenges incorrect assumptions. Capped at 6-8 questions.
- **Generated quiz** — Single-shot generation of 8-10 graduated-difficulty questions covering the breadth of the topic.

**Detects:**
- Knowledge level: beginner / intermediate / advanced
- Specific strengths
- Specific weaknesses
- **Misconceptions** — things the user believes they know but understands incorrectly

**Output:** `KnowledgeProfile` persisted to the database.

### 2. Learning Planner Agent

**Purpose:** Generate a personalized, ordered learning plan.

**Input:** Knowledge profile + topic

**Behavior:**
- Addresses misconceptions first (corrective pieces)
- Builds on existing strengths (skips what the user already knows)
- Orders by prerequisite dependencies
- Keeps each piece focused (~15-20 min learning time)
- Generates 5-12 pieces depending on topic breadth and knowledge gaps

**Output:** `LearningPlan` with ordered `LearningPiece` records.

### 3. Content Generator Agent

**Purpose:** Generate interactive MDX content for each learning piece.

**Input:** Learning piece spec + knowledge profile + (optionally) previous evaluation feedback

**Output:** MDX string using only registered predefined components. Must include at least one interactive element and an exercise at the end.

**Validation:** Uses the MDX validator tool to self-check output before persisting. Retries up to 2 times on validation failure.

### 4. JSX Generator Agent

**Purpose:** Generate custom React components when predefined components are insufficient.

**Loop:**
1. **Idea** — Describe what custom component would best illustrate the concept
2. **Plan** — Define props interface, rendering approach, visual design
3. **Implement** — Generate TypeScript React component source
4. **QA** — Static analysis (AST blocklist/allowlist) + render validation (renderToString with timeout)
5. If QA fails, loop back to step 3 (max 3 iterations)

**Rate limit:** Max 5 calls per day.

**Fallback:** If all 3 iterations fail, fall back to predefined components only.

### 5. Evaluator Agent

**Purpose:** Grade user exercise submissions.

**Input:** Exercise prompt, expected answer (if any), user's answer, learning piece context

**Output:**
- Score: 1-10
- Constructive feedback explaining what was correct and what was missed
- Newly identified misconceptions
- Identified strengths

**Regeneration trigger:** Score < 5 triggers content regeneration for the learning piece.

## Agent Workflow

```
User enters topic
       │
       ▼
┌──────────────┐
│  Diagnostic  │ ── Socratic interview OR quiz
│    Agent     │
└──────┬───────┘
       │ Knowledge Profile
       ▼
┌──────────────┐
│   Learning   │ ── Generates ordered plan
│   Planner    │
└──────┬───────┘
       │ Learning Plan
       ▼
┌──────────────────────────────────────────────────┐
│  For each learning piece:                        │
│                                                  │
│  Content Generator ──► (needs custom component?) │
│         │                    │                   │
│         │              JSX Generator             │
│         │              (loop + QA)               │
│         ▼                                        │
│  User studies MDX content                        │
│         │                                        │
│         ▼                                        │
│  User completes exercise                         │
│         │                                        │
│         ▼                                        │
│  Evaluator Agent ──► score 1-10                  │
│         │                                        │
│         ├── score >= 5 → next piece              │
│         └── score < 5  → archive content         │
│                          → regenerate with       │
│                            evaluation feedback   │
└──────────────────────────────────────────────────┘
```

## Inter-Agent Communication

Agents don't call each other directly. They communicate through the database:

1. Diagnostic Agent writes a `KnowledgeProfile`
2. Learning Planner reads the profile, writes a `LearningPlan` with `LearningPiece` records
3. Content Generator reads a piece spec + profile, writes a `ContentVersion`
4. Evaluator reads exercise + answer, writes an `Evaluation`, updates piece status

This decoupled design allows each agent to be called independently via separate API endpoints, which is necessary for the Vercel 10-second function timeout constraint.
