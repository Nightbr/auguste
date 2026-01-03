# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Auguste is an open-source, AI-powered meal planning application built with Node.js and TypeScript. It uses the Mastra framework for agentic AI workflows and SQLite for local-first data storage. The application is named after Auguste Escoffier, the father of modern cuisine.

## Essential Commands

```bash
# Run the interactive family setup CLI
npm run init

# Development server (via Mastra)
npm run dev

# Build the application
npm run build

# Start the production application
npm run start
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

The codebase follows **clean architecture** with three distinct layers:

### Domain Layer (`src/domain/`)

Pure business logic with no AI/agent dependencies.

- `db/` - SQLite connection, schema (in `schema.ts`), and utilities
- `schemas/` - Zod 4 validation schemas and TypeScript types

### Mastra Layer (`src/mastra/`)

AI agents, tools, and workflows built on the Mastra framework.

- `agents/` - Conversational AI agents (init-orchestrator, family-config, planner-config, weather)
- `tools/` - Database operation tools that agents can call
- `workflows/` - Multi-step agent orchestrations
- `scorers/` - Evaluation metrics for agent responses
- `index.ts` - Mastra instance configuration

### CLI Layer (`src/cli/`)

User interface - currently only `init.ts` for interactive family setup.

## Database Schema

Four main tables in SQLite:

- **Family** - Household information (name, country, language)
- **Member** - Individual members with dietary restrictions/allergies/preferences
- **MemberAvailability** - Tracks which meals members attend
- **PlannerSettings** - Meal planning configuration

Foreign key relationships: `Member.familyId → Family`, `MemberAvailability.memberId → Member`, `PlannerSettings.familyId → Family`

## Important Patterns

- **Embedded SQL Schema**: The SQL schema is defined as a TypeScript constant in `src/domain/db/schema.ts` to avoid build/path issues and ensure type safety.
- **Zod 4 Syntax**: Uses modern Zod syntax like `z.uuid()` not `z.string().uuid()`.
- **Const Enums**: Used for enums with proper TypeScript types.
- **No `any` Types**: TypeScript strict mode is enabled - avoid `any`.
- **ESM Only**: Package type is `"module"` - uses ES2022 modules.

## AI Agents

1. **Init Orchestrator Agent** (`init-orchestrator-agent.ts`) - Guides users through initial family setup via conversational interface
2. **Family Config Agent** (`family-config-agent.ts`) - Handles family configuration tasks
3. **Planner Config Agent** (`planner-config-agent.ts`) - Manages meal planning settings
4. **Weather Agent** (`weather-agent.ts`) - Provides weather info and activity suggestions

## MCP Integration

The project includes `.vscode/mcp.json` for Mastra MCP server integration with Claude Code.

## Specs Folder

The `specs/` directory contains comprehensive design documentation:

- `architecture.md` - System architecture and layer responsibilities
- `database-schema.md` - Database design details
- `data-models.md` - Type definitions
- `conversational-flow.md` - Agent conversation patterns
- `design-guidelines.md` - UI/UX patterns
- `implementation-plan.md` - Development roadmap
- `TODO.md` - Future tasks
