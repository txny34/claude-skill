# Product Vision

## What is SkillForge?

SkillForge is an AI-powered adaptive learning platform for software developers. It uses specialized AI agents to diagnose a developer's knowledge level on any software topic, generate a personalized learning plan, and deliver interactive content that adapts based on performance.

## Problem

Learning software development topics is fragmented. Developers either get content that's too basic (wasting time) or too advanced (creating frustration). Existing platforms don't assess what you already know before teaching.

## Solution

An adaptive loop powered by AI agents:

1. **Diagnose** what the developer already knows (including misconceptions)
2. **Plan** a personalized learning path that skips known material
3. **Teach** through AI-generated interactive content (diagrams, quizzes, visualizations)
4. **Evaluate** comprehension through exercises graded by AI
5. **Adapt** by regenerating content when comprehension is insufficient

## Target User

Software developers at any level who want to learn new topics efficiently. The MVP is single-tenant (personal use).

## Domain Scope

Software development topics only. The system handles any free-form topic within this domain (e.g., "React Server Components", "Docker networking", "GraphQL subscriptions").

## Key Differentiator

The content is not pre-built. Every diagram, quiz, and explanation is generated specifically for the learner's current level and gaps, rendered as interactive React components via MDX.
