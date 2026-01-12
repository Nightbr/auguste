# AI Agent Guidelines (AGENTS.md)

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

Auguste is an open-source, AI-powered meal planning application built with Node.js and TypeScript. It uses the AI framework (Mastra) for agentic AI workflows and SQLite for local-first data storage. The application is named after Auguste Escoffier, the father of modern cuisine.

## Essential Commands

```bash
# Development server (via Mastra)
pnpm run dev

# Run Mastra Studio (Visual Interface)
pnpm run studio

# Build all packages
pnpm run build

# Type-check everything
pnpm run type-check

# Run all tests
pnpm test

# Lint and format
pnpm run lint
pnpm run format

# Database Management
pnpm run db:generate -- --name <description>  # Generate migration
pnpm run db:migrate                          # Apply migrations
pnpm run seed                                # Seed database
```

## Environment Setup

1. **Node.js version management**: This project uses [mise](https://mise.jdx.dev/) for Node.js version management
   - Install mise: `curl https://mise.run | sh` (or see [mise installation docs](https://mise.jdx.dev/getting-started.html))
   - Run `mise install` in the project directory to install Node.js 24
   - Alternatively, use any Node.js 24+ installation
2. Copy `.env.example` to `.env`
3. Set `OPENROUTER_API_KEY` (get from <https://openrouter.ai/keys>)
4. Database location: Automatically stored at `.data/auguste.db` in the project root (works correctly even when Mastra changes working directory). Override via `AUGUSTE_DB_PATH` env var if needed.

## Architecture

Auguste is organized as a **pnpm monorepo**. The core business logic and AI implementation reside in `@auguste/core`.

### Core Package (`packages/core/src/`)

The `@auguste/core` package follows **clean architecture**:

#### Domain Layer (`packages/core/src/domain/`)

Pure business logic with no AI dependencies.

- `db/` - SQLite connection, Drizzle schema, and migrations
- `db/migrations/` - SQL migration files
- `schemas/` - Zod validation schemas and TypeScript types

#### AI (Mastra) Layer (`packages/core/src/ai/`)

AI agents, tools, and workflows built on the Mastra framework.

- `agents/` - Conversational AI agents
- `tools/` - Database operation tools for agents
- `workflows/` - Multi-step orchestrations
- `scorers/` - Evaluation metrics
- `index.ts` - AI (Mastra) configuration

## Database Schema

Four main tables in SQLite:

- **Family** - Household information (name, country, language)
- **Member** - Individual members with dietary restrictions/allergies/preferences
- **MemberAvailability** - Tracks which meals members attend
- **PlannerSettings** - Meal planning configuration

Foreign key relationships: `Member.familyId → Family`, `MemberAvailability.memberId → Member`, `PlannerSettings.familyId → Family`

## Important Patterns

- **Descriptive Migration Naming**: Always use the `--name` flag when generating migrations (e.g., `pnpm run db:generate -- --name add_user_table`). Never use the default random names.
- **Zod 4 Syntax**: Uses modern Zod syntax like `z.uuid()` not `z.string().uuid()`.
- **Task Management**: When a task in `specs/TODO.md` is completed, **remove it** from the file instead of just marking it with `[x]`.
- **Documentation Naming**: All files in `/docs` and `/specs` MUST follow **kebab-case** and be lowercase (e.g., `database-management.md`).
- **Const Enums**: Used for enums with proper TypeScript types.
- **No `any` Types**: TypeScript strict mode is enabled - avoid `any`.
- **ESM Only**: Package type is `"module"` - uses ES2022 modules.

## AI Agents

1. **Init Orchestrator Agent** (`init-orchestrator-agent.ts`) - Guides users through initial family setup via conversational interface
2. **Family Config Agent** (`family-config-agent.ts`) - Handles family configuration tasks
3. **Planner Config Agent** (`planner-config-agent.ts`) - Manages meal planning settings
4. **Weather Agent** (`weather-agent.ts`) - Provides weather info and activity suggestions

## MCP Integration

The project includes `.vscode/mcp.json` for Mastra MCP server integration with AI coding assistants.

## Specs Folder

The `specs/` directory contains comprehensive design documentation:

- `architecture.md` - System architecture and layer responsibilities
- `database-schema.md` - Database design details
- `data-models.md` - Type definitions
- `conversational-flow.md` - Agent conversation patterns
- `design-guidelines.md` - UI/UX patterns
- `implementation-plan.md` - Development roadmap
- `TODO.md` - Future tasks
