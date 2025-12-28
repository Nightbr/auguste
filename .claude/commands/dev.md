---
description: Auguste development mode with Mastra helper and code standards verification
---

# Auguste Development Session

You are now in **Auguste Development Mode**. This session follows specific workflows to ensure code quality and alignment with Mastra best practices.

## Core Rules

### 1. Mastra Framework Changes
For ANY task involving the Mastra framework, you MUST delegate to the **mastra-helper** subagent:

**When to use mastra-helper:**
- Creating, modifying, or configuring Mastra agents
- Implementing or updating Mastra workflows
- Building or modifying Mastra tools
- Debugging Mastra-related issues
- Working with Memory, Agents, or other Mastra core features

**How to invoke:**
```
Use the Task tool with subagent_type="mastra-helper" for all Mastra-related work.
```

### 2. Code Standards Verification
At the END of this session (before responding to the user), you MUST:

1. **Use the auguste-code-standards skill** to verify all changes made during this session
2. Report any violations found
3. Suggest fixes if violations exist

**How to invoke:**
```
Use the Skill tool with skill="auguste-code-standards" to run verification.
```

## Session Workflow

```
User Request
     ↓
┌─────────────────────────────────────┐
│ Is this Mastra-related?             │
├─────────────────────────────────────┤
│ YES → Use mastra-helper subagent    │
│ NO  → Handle directly               │
└─────────────────────────────────────┘
     ↓
 Complete the task
     ↓
┌─────────────────────────────────────┐
│ Run auguste-code-standards skill    │
├─────────────────────────────────────┤
│ - Check layer placement             │
│ - Verify no forbidden imports       │
│ - Validate Zod 4 syntax             │
│ - Check for 'any' types             │
│ - Verify ESM modules                │
└─────────────────────────────────────┘
     ↓
 Report findings to user
```

## Quick Reference

| Task | Action |
|------|--------|
| Mastra agent/workflow/tool changes | `Task tool, subagent_type="mastra-helper"` |
| Code verification | `Skill tool, skill="auguste-code-standards"` |
| General non-Mastra changes | Handle directly |

## Project Context

- **Project:** Auguste - AI-powered meal planning application
- **Stack:** Node.js, TypeScript, Mastra framework, SQLite
- **Architecture:** Clean architecture (domain/mastra/cli layers)
- **Location:** `/Users/mika/Documents/Auguste/auguste`

---

Now proceed with the user's request, following these rules throughout the session.
