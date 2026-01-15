# Non-Overlapping Meal Planning Dates

## Goal

Ensure a Family can have multiple meal planning entries but `startDate` & `endDate` should be unique and non-overlapping.

## Current State

- `MealPlanning` table has `familyId`, `startDate`, `endDate`, `status`
- No constraint preventing overlapping date ranges for the same family
- `createMealPlanning` tool directly inserts without validation
- Business logic is currently in tools, should be in domain services

## Implementation Plan

### 1. Create Domain Service Function

**File:** `packages/core/src/domain/services/meal-planning-service.ts` (new file)

Create a dedicated service for meal planning business logic:

```typescript
/**
 * Check if a date range overlaps with existing meal plannings for a family.
 * Overlap condition: existingStart <= newEnd AND existingEnd >= newStart
 * 
 * @param familyId - The family ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)  
 * @param excludeId - Optional planning ID to exclude (for updates)
 * @returns Array of overlapping plannings, or empty array if none
 */
export async function findOverlappingMealPlannings(
  familyId: string,
  startDate: string,
  endDate: string,
  excludeId?: string
): Promise<MealPlanning[]>

/**
 * Create a new meal planning with overlap validation.
 * Throws an error if the date range overlaps with existing plannings.
 */
export async function createMealPlanningWithValidation(
  input: CreateMealPlanningInput
): Promise<MealPlanning>

/**
 * Update a meal planning with overlap validation (if dates are changed).
 */
export async function updateMealPlanningWithValidation(
  id: string,
  input: Partial<CreateMealPlanningInput>
): Promise<MealPlanning>
```

### 2. Update AI Tools to Use Domain Service

**File:** `packages/core/src/ai/tools/meal-tools.ts`

Refactor tools to be thin wrappers around domain services:

```typescript
export const createMealPlanning = createTool({
  id: 'create-meal-planning',
  description: 'Create a new weekly meal planning cycle',
  inputSchema: CreateMealPlanningInputSchema,
  outputSchema: MealPlanningSchema,
  execute: async (input) => {
    return createMealPlanningWithValidation(input);
  },
});
```

### 3. Update Agent Instructions

**File:** `packages/core/src/ai/agents/meal-planner-agent.ts`

Add instruction about the overlap rule so the agent can explain errors to users:

```
OVERLAP RULE:
- Meal plannings for a family cannot have overlapping date ranges.
- If a user tries to create a planning that overlaps with an existing one, 
  explain the conflict and suggest alternative dates.
- Use 'get-meal-planning' to check for existing plannings before creating new ones.
```

### 4. Unit Tests

**File:** `packages/core/src/domain/services/meal-planning-service.test.ts` (new file)

Test cases:
- ✅ Creating non-overlapping plannings should succeed
- ❌ Creating overlapping plannings should fail with descriptive error
- ❌ Creating planning with same exact dates should fail
- ✅ Creating adjacent plannings (end = next start - 1 day) should succeed
- ❌ Updating planning dates to create overlap should fail
- ✅ Updating planning dates to non-overlapping should succeed
- ✅ `excludeId` parameter should exclude the planning from overlap check (for updates)

## Design Decisions

### Why Application-Level Validation?

SQLite doesn't support complex constraints like "no overlapping ranges" natively. While we could use triggers, application-level validation in the domain service provides:
- Better error messages
- Easier testing
- More flexibility for future business rules

### Should Drafts Be Checked?

**Yes** - All plannings regardless of status are checked for overlap. Rationale:
- Drafts represent intent to plan for those dates
- Prevents confusion when activating a draft
- Simpler mental model for users

### Edge Cases

| Scenario | Overlap? |
|----------|----------|
| Same exact dates | ✅ Yes |
| Partial overlap (A ends during B) | ✅ Yes |
| B fully inside A | ✅ Yes |
| Adjacent (A ends Jan 7, B starts Jan 8) | ❌ No |
| Same start, different end | ✅ Yes |

## Questions Resolved

1. **Draft vs Active plannings?** → All plannings are checked
2. **Exact same dates?** → Considered overlapping (yes)
3. **Error message format?** → Include conflicting planning dates for clarity

