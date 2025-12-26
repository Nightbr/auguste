# Auguste - Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for Auguste's `/init` phase, 
which handles family configuration and meal planning setup.

## Development Phases

### Phase 1: Foundation (Database & Models)

**Goal:** Set up the data layer with SQLite and Zod schemas.

| Task | File | Description |
|------|------|-------------|
| 1.1 | `src/domain/db/schema.sql` | Create SQLite schema |
| 1.2 | `src/domain/db/index.ts` | Database connection & utilities |
| 1.3 | `src/domain/schemas/enums.ts` | Enum definitions (const objects) |
| 1.4 | `src/domain/schemas/family.schema.ts` | Family & Member Zod schemas |
| 1.5 | `src/domain/schemas/planner.schema.ts` | PlannerSettings Zod schema |
| 1.6 | `src/domain/schemas/index.ts` | Export all schemas |

**Dependencies:** None

---

### Phase 2: Database Tools

**Goal:** Create Mastra tools for database CRUD operations.

| Task | File | Description |
|------|------|-------------|
| 2.1 | `src/mastra/tools/family-tools.ts` | createFamily, getFamily, updateFamily |
| 2.2 | `src/mastra/tools/member-tools.ts` | createMember, getMembers, updateMember, deleteMember |
| 2.3 | `src/mastra/tools/availability-tools.ts` | setMemberAvailability, getMemberAvailability |
| 2.4 | `src/mastra/tools/planner-tools.ts` | createPlannerSettings, getPlannerSettings, updatePlannerSettings |
| 2.5 | `src/mastra/tools/index.ts` | Export all tools |

**Dependencies:** Phase 1

---

### Phase 3: AI Agents

**Goal:** Create the conversational agents for the init flow.

| Task | File | Description |
|------|------|-------------|
| 3.1 | `src/mastra/agents/family-config-agent.ts` | Family configuration agent |
| 3.2 | `src/mastra/agents/planner-config-agent.ts` | Planner configuration agent |
| 3.3 | `src/mastra/agents/init-orchestrator-agent.ts` | Orchestrates the init flow |
| 3.4 | `src/mastra/agents/index.ts` | Export all agents |

**Dependencies:** Phase 2

---

### Phase 4: Workflows

**Goal:** Create the init workflow that chains agents together.

| Task | File | Description |
|------|------|-------------|
| 4.1 | `src/mastra/workflows/init-workflow.ts` | Init phase workflow |
| 4.2 | `src/mastra/index.ts` | Register new agents & workflows |

**Dependencies:** Phase 3

---

### Phase 5: Testing & Polish

**Goal:** Ensure quality and handle edge cases.

| Task | Description |
|------|-------------|
| 5.1 | Test conversational flows end-to-end |
| 5.2 | Add input validation and error handling |
| 5.3 | Handle edge cases (empty family, missing data) |
| 5.4 | Create example CLI interaction script |

**Dependencies:** Phase 4

---

## Tool Specifications

| Tool Name | Input | Output | Agent |
|-----------|-------|--------|-------|
| `createFamily` | `{ name: string }` | `Family` | FamilyConfig |
| `getFamily` | `{ id: string }` | `Family \| null` | Both |
| `updateFamily` | `{ id: string, name?: string }` | `Family` | FamilyConfig |
| `createMember` | `CreateMemberInput` | `Member` | FamilyConfig |
| `getMembers` | `{ familyId: string }` | `Member[]` | Both |
| `updateMember` | `{ id: string, ...updates }` | `Member` | FamilyConfig |
| `deleteMember` | `{ id: string }` | `boolean` | FamilyConfig |
| `setMemberAvailability` | `{ memberId, mealType, dayOfWeek, isAvailable }` | `MemberAvailability` | PlannerConfig |
| `getMemberAvailability` | `{ memberId: string }` | `MemberAvailability[]` | PlannerConfig |
| `createPlannerSettings` | `CreatePlannerSettingsInput` | `PlannerSettings` | PlannerConfig |
| `getPlannerSettings` | `{ familyId: string }` | `PlannerSettings \| null` | PlannerConfig |
| `updatePlannerSettings` | `{ id: string, ...updates }` | `PlannerSettings` | PlannerConfig |

---

## Success Criteria

- [ ] User can complete family setup through conversation
- [ ] All family members are persisted to SQLite
- [ ] Dietary restrictions and allergies are captured
- [ ] Meal planning schedule is configured
- [ ] Member availability is tracked per meal/day
- [ ] Notification cron expression is set
- [ ] Data can be retrieved and displayed as summary

---

## Estimated Timeline

| Phase | Estimated Time |
|-------|----------------|
| Phase 1: Foundation | 1-2 hours |
| Phase 2: Database Tools | 2-3 hours |
| Phase 3: AI Agents | 2-3 hours |
| Phase 4: Workflows | 1-2 hours |
| Phase 5: Testing | 1-2 hours |
| **Total** | **7-12 hours** |

