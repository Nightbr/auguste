# Auguste - Architecture Overview

## System Architecture

```mermaid
flowchart TB
    subgraph UserInterface["User Interface"]
        API["API"]
    end

    subgraph Agents["AI Agents"]
        OBA["Onboarding Agent"]
        FEA["Family Editor Agent"]
        MPA["Meal Planner Agent"]
    end

    subgraph Tools["Database Tools"]
        FT["Family Tools"]
        MT["Member Tools"]
        AT["Availability Tools"]
        PT["Planner Settings Tools"]
        MET["Meal Event Tools"]
    end

    subgraph Database["SQLite Database"]
        FAM[("Family")]
        MEM[("Member")]
        AVL[("MemberAvailability")]
        PLS[("PlannerSettings")]
        MLE[("MealEvent")]
    end

    API --> OBA
    API --> FEA

    OBA --> FT
    OBA --> MT
    OBA --> AT
    OBA --> PT

    FEA --> FT
    FEA --> MT
    FEA --> AT
    FEA --> PT

    MPA --> FT
    MPA --> MT
    MPA --> AT
    MPA --> PT
    MPA --> MET

    FT --> FAM
    MT --> MEM
    AT --> AVL
    PT --> PLS
    MET --> MLE

    MEM -.->|"foreignKey"| FAM
    AVL -.->|"foreignKey"| MEM
    PLS -.->|"foreignKey"| FAM
    MLE -.->|"foreignKey"| FAM
```

## Project Structure

Auguste is organized as a **pnpm monorepo**.

```
.
├── apps/                             # Applications (future)
├── packages/
│   └── core/                         # Core package (@auguste/core)
│       ├── src/
│       │   ├── domain/               # Domain layer (data models & database)
│       │   │   ├── db/
│       │   │   │   ├── index.ts      # Drizzle client & connection
│       │   │   │   ├── schema.drizzle.ts # Drizzle ORM schema definition
│       │   │   │   ├── migrate.ts    # Migration runner
│       │   │   │   └── migrations/   # SQL migrations
│       │   │   └── schemas/
│       │   │       ├── index.ts      # Export all schemas
│       │   │       ├── enums.ts      # Type-safe enums
│       │   │       ├── family.schema.ts # Family & Member schemas
│       │   │       └── planner.schema.ts # PlannerSettings schemas
│       │   │
│       │   └── ai/                   # AI (Mastra) Layer
│       │       ├── index.ts          # Mastra instance
│       │       ├── tools/            # Database access tools
│       │       └── agents/           # AI agents
│       │
│       └── package.json              # Package manifest
│
├── specs/                            # Specifications & documentation
├── docs/                             # Additional guides
├── pnpm-workspace.yaml               # Workspace config
├── turbo.json                        # Turborepo config
└── package.json                      # Root manifest
```

## Agents

### Onboarding Agent (`onboarding-agent.ts`)

Handles the complete first-time setup flow:

- Family creation (name, country, language)
- Member registration (preferences, allergies, dietary restrictions)
- Planner settings (meal types, days, notifications)

### Family Editor Agent (`family-editor-agent.ts`)

Handles updates to an existing family configuration:

- Add/edit/remove family members
- Update family information
- Modify planner settings
- Change member availability

### Meal Planner Agent (`meal-planner-agent.ts`)

Handles the weekly meal planning process:

- Generates meal events for the next 7 days based on settings
- Suggests meals for each event based on preferences
- Validates and iteratively modifies the plan with the user

## Layer Responsibilities

### Domain Layer (`packages/core/src/domain/`)

- **Database**: SQLite connection, schema, and versioned migrations.
  - All migrations must use descriptive names: `pnpm run db:generate -- --name <feature>`.
- **Schemas**: Zod validation schemas, TypeScript types
- **Pure business logic**: No AI/agent dependencies

### Mastra Layer (`packages/core/src/ai/`)

- **Tools**: Database access tools for agents
- **Agents**: AI agents with prompts and tool bindings
