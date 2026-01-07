# AGENT.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

Auguste is an open-source, AI-powered meal planning application built with Node.js and TypeScript. It uses the AI framework (Mastra) for agentic AI workflows and SQLite for local-first data storage. The application is named after Auguste Escoffier, the father of modern cuisine.

## Essential Commands

```bash
# Development server (via Mastra)
npm run dev

# Build the application
npm run build

# Start the production application
npm run start

# Database Management
npm run db:generate -- --name <description>  # Generate migration (always name it!)
npm run db:migrate                          # Apply migrations
npm run seed                                # Seed database
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

The codebase follows **clean architecture** with two distinct layers:

### Domain Layer (`src/domain/`)

Pure business logic with no AI/agent dependencies.

- `db/` - SQLite connection, Drizzle schema, and migrations
- `db/migrations/` - SQL migration files (0000_descriptive_name.sql)
- `schemas/` - Zod 4 validation schemas and TypeScript types

For detailed database workflows, see [docs/database-management.md](docs/database-management.md).

### AI (Mastra) Layer (`src/ai/`)

AI agents, tools, and workflows built on the AI framework (Mastra).

- `agents/` - Conversational AI agents (init-orchestrator, family-config, planner-config, weather)
- `tools/` - Database operation tools that agents can call
- `workflows/` - Multi-step agent orchestrations
- `scorers/` - Evaluation metrics for agent responses
- `index.ts` - AI (Mastra) instance configuration

## Database Schema

Four main tables in SQLite:

- **Family** - Household information (name, country, language)
- **Member** - Individual members with dietary restrictions/allergies/preferences
- **MemberAvailability** - Tracks which meals members attend
- **PlannerSettings** - Meal planning configuration

Foreign key relationships: `Member.familyId → Family`, `MemberAvailability.memberId → Member`, `PlannerSettings.familyId → Family`

## Important Patterns

- **Descriptive Migration Naming**: Always use the `--name` flag when generating migrations (e.g., `npm run db:generate -- --name add_user_table`). Never use the default random names.
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
