---
name: Auguste Code Standards
description: Enforces Auguste project coding practices and clean architecture. Use when writing code, reviewing changes, adding features, or refactoring in the Auguste meal planning application. Check code organization, Zod syntax, TypeScript strict mode compliance, and layer separation.
---

# Auguste Code Standards

Enforces coding practices and architectural organization for the Auguste project, an AI-powered meal planning application built with Node.js, TypeScript, and the Mastra framework.

## Prerequisites

- Familiarity with the project structure defined in [CLAUDE.md](../../CLAUDE.md)
- Understanding of clean architecture principles
- TypeScript strict mode enabled
- Node.js 22.13.0+

## Architecture Overview

The Auguste codebase follows **clean architecture** with three distinct layers:

### 1. Domain Layer (`src/domain/`)

Pure business logic with **no AI/agent dependencies**.

- `db/` - SQLite connection, schema (embedded as string), utilities
- `schemas/` - Zod 4 validation schemas and TypeScript types

**Allowed in Domain:**

- Pure TypeScript functions
- Zod schemas (modern syntax)
- SQLite database operations
- Business logic validation
- Type definitions

**Forbidden in Domain:**

- AI agent imports
- Mastra framework imports
- Agent orchestration logic
- External API calls (except database)

### 2. Mastra Layer (`src/mastra/`)

AI agents, tools, and workflows built on the Mastra framework.

- `agents/` - Conversational AI agents
- `tools/` - Database operation tools that agents can call
- `workflows/` - Multi-step agent orchestrations
- `scorers/` - Evaluation metrics for agent responses

### 3. CLI Layer (`src/cli/`)

User interface code.

- Interactive commands
- User input handling
- Output formatting

## Workflow

When writing or reviewing code for Auguste:

1. **Verify Layer Placement**:
   - Domain code goes in `src/domain/`
   - AI/agent code goes in `src/mastra/`
   - CLI code goes in `src/cli/`
   - Cross-layer imports must follow dependency rule: CLI → Mastra → Domain

2. **Check Domain Layer Purity**:
   - No imports from `@mastra/core` or Mastra layer
   - No AI/agent dependencies
   - Pure business logic only

3. **Validate Zod 4 Syntax**:
   - Use `z.uuid()` not `z.string().uuid()`
   - Use modern Zod 4 syntax throughout
   - Check `src/domain/schemas/` for examples

4. **Enforce TypeScript Strict Mode**:
   - No `any` types
   - All types must be explicitly defined
   - Enable `strict: true` in tsconfig.json

5. **Verify ESM Modules**:
   - Use ES2022 module syntax
   - No CommonJS (`require`, `module.exports`)
   - Package type is `"module"`

6. **Check Database Operations**:
   - Schema is defined in `src/domain/db/schema.ts` as TypeScript constant
   - Single source of truth for database schema
   - Use the exported SCHEMA constant for migrations

## Common Patterns

### Adding a New Schema

```typescript
// src/domain/schemas/recipe.ts
import { z } from 'zod';

export const recipeSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  servings: z.number().int().positive(),
  // ... modern Zod 4 syntax
});

export type Recipe = z.infer<typeof recipeSchema>;
```

### Adding a Mastra Tool

```typescript
// src/mastra/tools/recipe-tool.ts
import { createTool } from '@mastra/core';
import { z } from 'zod';
// Import domain schemas, NOT the other way around
import { recipeSchema } from '../../domain/schemas/recipe';

export const recipeTool = createTool({
  id: 'recipe-tool',
  description: 'Manage recipes',
  inputSchema: z.object({
    action: z.enum(['create', 'read', 'update', 'delete']),
    recipe: recipeSchema.optional(),
  }),
  execute: async ({ context }) => {
    // Implementation
  },
});
```

### Forbidden Cross-Layer Import

```typescript
// WRONG - Domain importing from Mastra
// src/domain/schemas/recipe.ts
import { someAgent } from '../../mastra/agents/some-agent'; // ❌

// CORRECT - Mastra importing from Domain
// src/mastra/agents/recipe-agent.ts
import { recipeSchema } from '../../domain/schemas/recipe'; // ✅
```

## Examples

### Example 1: Adding a New Feature

User request:

```
Add a feature to track grocery lists
```

You would:

1. Create domain schemas in `src/domain/schemas/grocery.ts`:
   - Define `groceryListSchema` using Zod 4 syntax
   - Use `z.uuid()` for IDs
   - Export inferred types
2. Add database functions in `src/domain/db/grocery.ts`:
   - Pure SQL operations
   - No AI dependencies
3. Create Mastra tool in `src/mastra/tools/grocery-tool.ts`:
   - Import domain schemas
   - Wrap DB operations for agent use
4. Update agent in `src/mastra/agents/`:
   - Add tool to agent's toolkit
5. Add CLI command if needed in `src/cli/`

### Example 2: Code Review

User request:

```
Review this PR for architecture compliance
```

You would:

1. Check all new files are in correct layer:
   - Domain files in `src/domain/`
   - Mastra files in `src/mastra/`
   - CLI files in `src/cli/`
2. Verify no forbidden imports:
   ```bash
   grep -r "from.*mastra" src/domain/  # Should return nothing
   grep -r "@mastra/core" src/domain/  # Should return nothing
   ```
3. Check Zod syntax:
   ```bash
   grep -r "z.string().uuid()" src/domain/schemas/  # Should return nothing
   ```
4. Look for `any` types:
   ```bash
   grep -r ": any" src/  # Should return nothing
   ```
5. Report violations with file locations

### Example 3: Fixing a Violation

User request:

```
I found an any type in src/domain/schemas/member.ts:15
```

You would:

1. Read the file to understand context
2. Replace `any` with proper type:
   - If it's an enum, define a const enum
   - If it's a union type, define it explicitly
   - If it's complex, create a proper interface/type
3. Verify no other violations in the file
4. Test that changes compile

### Example 4: Database Schema Changes

User request:

```
Add a new column to the Member table for dietary preferences
```

You would:

1. Update the schema in `src/domain/db/schema.ts`:
   - Add column to `CREATE TABLE` statement in the SCHEMA constant
   - This is the single source of truth for database schema
2. Update domain schema in `src/domain/schemas/member.ts`:
   - Use Zod 4 syntax for new field
3. Update any migration logic
4. Ensure Mastra tools handle new field correctly

## Quick Checklist

Before considering code complete:

- [ ] Files are in correct layer (domain/mastra/cli)
- [ ] No `any` types
- [ ] Modern Zod 4 syntax (`z.uuid()` not `z.string().uuid()`)
- [ ] Domain layer has no Mastra imports
- [ ] ESM module syntax used
- [ ] TypeScript strict mode compliant
- [ ] Database schema embedded as string
