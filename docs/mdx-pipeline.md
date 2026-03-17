# MDX Pipeline

## Overview

SkillForge renders AI-generated learning content as interactive React components via MDX (Markdown + JSX). Content is generated at runtime by AI agents, not at build time.

## Predefined Components

The Content Generator agent outputs MDX that references these predefined components. Each component receives structured data as props — the agent generates the data, not the rendering logic.

### FlowDiagram

Renders directed graph diagrams (process flows, request lifecycles, state machines).

```tsx
<FlowDiagram
  nodes={[
    { id: "1", label: "Request", description: "HTTP request arrives" },
    { id: "2", label: "Middleware", description: "Auth check" },
    { id: "3", label: "Handler" }
  ]}
  edges={[
    { from: "1", to: "2", label: "enters" },
    { from: "2", to: "3" }
  ]}
  direction="LR"
/>
```

**Tech:** elkjs for layout computation (server-side), positioned divs + SVG arrows (client-side).

### TreeDiagram

Renders hierarchical tree structures (file trees, inheritance, DOM, ASTs).

```tsx
<TreeDiagram
  root={{
    label: "src",
    children: [
      { label: "components", children: [{ label: "Button.tsx" }] },
      { label: "lib", children: [{ label: "utils.ts" }] }
    ]
  }}
/>
```

**Tech:** Recursive collapsible tree with expand/collapse toggles.

### DataVisualization

Renders charts (bar, line, pie, radar).

```tsx
<DataVisualization
  type="bar"
  data={[
    { label: "React", value: 85 },
    { label: "Vue", value: 60 },
    { label: "Svelte", value: 45 }
  ]}
  title="Framework Popularity"
  yLabel="Score"
/>
```

**Tech:** Recharts.

### InteractiveQuiz

Multiple-choice quiz with immediate per-question feedback.

```tsx
<InteractiveQuiz
  questions={[
    {
      question: "What does useState return?",
      options: ["A value", "An array with value and setter", "A promise", "An object"],
      correctIndex: 1,
      explanation: "useState returns a tuple [value, setValue]."
    }
  ]}
/>
```

### CodeBlock

Syntax-highlighted code with line numbers and copy button.

```tsx
<CodeBlock
  code="const x = 42;"
  language="typescript"
  filename="example.ts"
  highlights={[1]}
  caption="Variable declaration"
/>
```

**Tech:** Shiki for syntax highlighting.

### Callout

Styled alert boxes for key concepts, warnings, and tips.

```tsx
<Callout type="warning" title="Common Pitfall">
  Don't mutate state directly in React.
</Callout>
```

### ComparisonTable

Responsive comparison tables with optional column highlighting.

```tsx
<ComparisonTable
  headers={["Feature", "REST", "GraphQL"]}
  rows={[
    { label: "Fetching", values: ["Multiple endpoints", "Single endpoint"] },
    { label: "Over-fetching", values: ["Common", "Avoided"] }
  ]}
  highlightColumn={2}
/>
```

## Arbitrary JSX Generation

For cases where predefined components aren't sufficient, the JSX Generator agent creates custom React components. These go through a QA loop:

### Static Analysis

Parses the generated code with `@babel/parser` and enforces:

**Blocked:** `eval`, `Function()`, `fetch`, `XMLHttpRequest`, `WebSocket`, `document.cookie`, `localStorage`, `sessionStorage`, `window.location`, `dangerouslySetInnerHTML`, `import()`, `require()`, `process`, `global`, `globalThis`

**Allowed imports:** `react` (hooks only), predefined MDX components, `recharts`

**Size limits:** Max 200 lines, max 5KB source

### Render Validation

- Server-side render with `react-dom/server` `renderToString()`
- Wrapped in React error boundary
- 2-second timeout
- Failure = loop back to implementation step

### Rate Limits

- Max 3 iterations per component generation attempt
- Max 5 generation attempts per day
- Fallback to predefined components if all attempts fail

## Compilation Pipeline

1. Content Generator agent outputs raw MDX string
2. **Sanitization** — Strip `<script>`, `import`/`export`, inline event handlers
3. **Validation** — Parse with `@mdx-js/mdx`, verify only allowlisted components, validate props against Zod schemas
4. **Compilation** — Compile with `next-mdx-remote/rsc` for server-side rendering
5. **Rendering** — Pass component registry as the `components` prop to `MDXRemote`
6. **Caching** — Store compiled output in database alongside raw MDX

## Content Versioning

Content is never deleted. When the Evaluator triggers regeneration (score < 5/10):

1. Current `ContentVersion` is archived (`isActive = false`)
2. New `ContentVersion` is created with `generationReason: "regeneration"` and incremented version number
3. Previous versions remain accessible for audit purposes
