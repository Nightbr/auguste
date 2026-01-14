# Calendar View with Meal Planning Widget

## Goal

Display a calendar widget showing all meal planning periods for a family. Allow users to click/select a specific meal planning to visualize its details and meal events.

## Current State

- **Planner Panel**: Has two tabs - "Weekly Plan" and "Calendar"
- **Calendar tab**: Currently just renders `WeeklyPlanView` (placeholder)
- **API**: Only returns the most recent meal planning (`getMealPlanningByFamilyId`)
- **usePlannerData hook**: Only fetches single planning + events

## Requirements

1. **Calendar Overview**: Display a calendar showing all meal planning periods
2. **Multiple Plannings**: Support viewing multiple meal planning cycles
3. **Period Selection**: Click on a planning period to view its details/events
4. **Visual Indicators**: Show planning status (draft/active/completed) with colors
5. **Navigation**: Navigate between months to see past/future plannings

## Implementation Plan

### Phase 1: Backend - New API Endpoint

**File:** `packages/core/src/domain/services/planner-service.ts`

Add function to get all meal plannings for a family:

```typescript
export async function getAllMealPlanningsByFamilyId(familyId: string) {
  return db
    .select()
    .from(mealPlanning)
    .where(eq(mealPlanning.familyId, familyId))
    .orderBy(desc(mealPlanning.startDate));
}
```

**File:** `apps/api/src/index.ts`

Add new endpoint:

```typescript
app.get('/api/family/:id/plannings', async (req, res) => {
  const { id } = req.params;
  const plannings = await getAllMealPlanningsByFamilyId(id);
  res.json(plannings);
});
```

### Phase 2: Frontend - API Client & Hook

**File:** `apps/web/src/lib/api-client.ts`

Add method to fetch all plannings:

```typescript
getAllMealPlannings: async (familyId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/family/${familyId}/plannings`);
  if (!response.ok) throw new Error('Failed to fetch meal plannings');
  return response.json();
},
```

**File:** `apps/web/src/hooks/use-planner-data.ts`

Extend hook to also fetch all plannings for calendar view.

### Phase 3: Calendar Component

**File:** `apps/web/src/components/planner/calendar-view.tsx` (new)

Create calendar view component:

```typescript
interface CalendarViewProps {
  familyId: string;
  plannings: MealPlanning[];
  selectedPlanningId?: string;
  onSelectPlanning: (planningId: string) => void;
}
```

Features:
- Monthly calendar grid
- Planning periods displayed as colored bars across date ranges
- Color coding by status:
  - Draft: Gray/dashed
  - Active: Green/solid
  - Completed: Blue/faded
- Click on planning to select and view details
- Navigation arrows for previous/next month

### Phase 4: Update Planner Panel

**File:** `apps/web/src/components/planner/planner-panel.tsx`

- Add state for selected planning
- When in calendar tab, show calendar + selected planning details
- When planning is selected, show its events in a side panel or below

### Phase 5: Planning Details Component

**File:** `apps/web/src/components/planner/planning-details.tsx` (new)

Display selected planning information:
- Date range
- Status badge
- Number of meal events
- List of meal events grouped by day

## UI Mockup

```
┌─────────────────────────────────────────────────────────┐
│  ◀  January 2026  ▶                                     │
├───────┬───────┬───────┬───────┬───────┬───────┬───────┤
│  Sun  │  Mon  │  Tue  │  Wed  │  Thu  │  Fri  │  Sat  │
├───────┼───────┼───────┼───────┼───────┼───────┼───────┤
│       │       │       │   1   │   2   │   3   │   4   │
│       │       │       │ ████████████████████████████  │ ← Week 1 (Jan 1-7)
├───────┼───────┼───────┼───────┼───────┼───────┼───────┤
│   5   │   6   │   7   │   8   │   9   │  10   │  11   │
│ ████  │       │       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← Week 2 (Jan 8-14)
├───────┼───────┼───────┼───────┼───────┼───────┼───────┤
│  12   │  13   │  14   │  15   │  16   │  17   │  18   │
│ ░░░░░ │       │       │                               │
└───────┴───────┴───────┴───────┴───────┴───────┴───────┘

Legend: ████ = Active   ░░░░ = Draft   ▒▒▒▒ = Completed
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/core/src/domain/services/planner-service.ts` | Modify | Add `getAllMealPlanningsByFamilyId` |
| `apps/api/src/index.ts` | Modify | Add `/api/family/:id/plannings` endpoint |
| `apps/web/src/lib/api-client.ts` | Modify | Add `getAllMealPlannings` method |
| `apps/web/src/hooks/use-planner-data.ts` | Modify | Add plannings query |
| `apps/web/src/components/planner/calendar-view.tsx` | Create | Calendar component |
| `apps/web/src/components/planner/planning-details.tsx` | Create | Planning details component |
| `apps/web/src/components/planner/planner-panel.tsx` | Modify | Integrate calendar view |

## Dependencies

Consider using:
- `date-fns` (already installed) for date manipulation
- No external calendar library needed - build simple month grid

## Edge Cases

1. **No plannings**: Show empty calendar with message "No meal plans yet"
2. **Overlapping plannings**: With our new overlap prevention, this shouldn't happen
3. **Long date ranges**: Planning spans multiple months - show partial bars at month edges
4. **Current month indicator**: Highlight today's date

