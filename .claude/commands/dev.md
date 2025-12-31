---
description: Auguste development mode with Mastra helper and code standards verification
---

# Auguste Development Session

You are now in **Auguste Development Mode**. This session follows specific workflows to ensure code quality and alignment with Mastra best practices.

## Core Rules

### 1. Mastra Framework Changes
For ANY task involving the Mastra framework, you MUST consult the **mastra-helper** agent:

**When to use mastra-helper:**
- Creating, modifying, or configuring Mastra agents
- Implementing or updating Mastra workflows
- Building or modifying Mastra tools
- Debugging Mastra-related issues
- Working with Memory, Agents, or other Mastra core features

**Important:** The mastra-helper agent is here to **guide you through the process**, not to do the work for you. It will provide context, explain patterns, and help you understand the Mastra framework's best practices. You remain responsible for implementing the actual changes.

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

### Specs Folder

The `specs/` directory contains comprehensive design documentation that serves as the source of truth for system architecture and implementation:

- **Keep it up to date:** When making architectural decisions or significant changes, update the relevant spec files to reflect the new state.
- **Use it as reference:** The specs folder can help you and other agents understand the global system context, including database design, agent patterns, and implementation plans.

Available specs:
- `architecture.md` - System architecture and layer responsibilities
- `database-schema.md` - Database design details
- `data-models.md` - Type definitions
- `conversational-flow.md` - Agent conversation patterns
- `design-guidelines.md` - UI/UX patterns
- `implementation-plan.md` - Development roadmap
- `TODO.md` - Future tasks

---

Now proceed with the user's request, following these rules throughout the session.
