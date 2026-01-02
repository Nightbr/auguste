# Meal Planner Agent Specification

## Overview

The Meal Planner Agent (`meal-planner-agent.ts`) is responsible for generating weekly meal plans for the family. It takes into account member availability, dietary restrictions, preferences, and planner settings to create a personalized schedule.

## Responsibilities

1.  **Schedule Generation**: Create `MealEvent` entries for the upcoming week based on `PlannerSettings` (active days, meal types) and `MemberAvailability`.
2.  **Meal Suggestion**: Propose specific meals/recipes for each event, strictly adhering to dietary restrictions (allergies) and optimizing for preferences (likes/dislikes).
3.  **Iteration**: Allow the user to review, modify, and finalize the plan.

## Workflow

### Phase 1: Event Definition (Skeleton Creation)

The agent first identifies _when_ meals are needed and _who_ is eating.

- **Input**: `PlannerSettings`, `MemberAvailability`
- **Process**:
  - Iterate through the next 7 days.
  - Check `PlannerSettings` for active days and meal types (e.g., Dinner on Mon-Fri).
  - For each potential slot, check `MemberAvailability` to determine participants.
  - Create `MealEvent` records with `status='proposed'` (or similar) and the list of `participants`.
- **Output**: A list of empty `MealEvent` slots (date, type, participants).

### Phase 2: Content Suggestion (Menu Planning)

For each empty slot, the agent selects a meal.

- **Input**: `MealEvent` (participants), `Member` details (restrictions, preferences), History (avoid repetition - _future feature_).
- **Process**:
  - Filter recipes/ideas based on constraints of _all_ participants in that event.
    - **Hard Constraint**: Allergies and restrictions (e.g., if one member is vegan, the meal is vegan).
  - Score potential meals based on preferences.
  - Assign a `recipeName` and `description` to the `MealEvent`.

### Phase 3: Review & Refinement

The agent presents the plan to the user.

- **Interactive Loop**:
  - "Here is the plan for next week..."
  - User: "Wednesday dinner looks too heavy, change it to a salad."
  - Agent updates that specific event.
  - User: "Actually, Mike won't be home on Tuesday."
  - Agent updates participants for Tuesday and potentially re-suggests the meal.
- **Finalization**: User approves the plan. Status changes to `active`.

## Agent Prompt Guidelines

### System Prompt

```
You are Auguste's Executive Chef and Meal Planner. Your goal is to create delicious, practical, and compliant meal plans for the family.

CRITICAL RULES:
1. SAFETY FIRST: Never suggest a meal that violates a member's allergy.
2. RESPECT RESTRICTIONS: Adhere strictly to dietary restrictions (Vegan, Kosher, etc.) of participating members.
3. PREFERENCES: Prioritize meals that members like, avoid what they dislike.
4. LOGIC: If a member is not available for a meal, do not consider their preferences for that specific event.

Process:
1. Analyze the schedule and participants for each meal.
2. Suggest a diverse menu for the week.
3. Present the plan clearly (group by day).
4. Iterate based on user feedback.
```

### Tool Usage

- `get_family_info`: Retrieve settings and members.
- `get_availability`: Check who is around.
- `create_meal_planning`: Start a new planning cycle.
- `create_meal_event`: Save slots.
- `update_meal_event`: Modify meals or participants.
- `search_recipes` (hypothetical): Look up meal ideas.

## Data Interactions

- **Read**: `Family`, `Member`, `PlannerSettings`, `MemberAvailability`
- **Write**: `MealPlanning`, `MealEvent`

## Edge Cases

- **Conflicting Restrictions**: One member is pure carnivore, another is vegan -> Suggest separate components or a "build your own" style meal (tacos, bowls).
- **No Available Members**: Do not schedule a meal event if no one is explicitly available, unless settings dictate "Always plan dinner".
- **Empty Preferences**: Fall back to generally popular, healthy meals suited to the family's skill level.
