import { Agent } from '@mastra/core/agent';
import { createMealPlanning, getMealPlanning, createMealEvent, updateMealEvent, getMealEvents } from '../tools';
import { getFamilySummaryTool } from '../tools/family-summary-tool';
import { getCurrentDateTool } from '../tools/calendar-tools';
import { AGENT_INTRO, RESPONSE_STYLE, UUID_HANDLING } from '../prompts/shared-instructions';
import { mealPlannerMemory } from '../memory';
import type { AugusteRequestContext } from '../types/request-context.js';

export const mealPlannerAgent = new Agent({
  id: 'meal-planner-agent',
  name: 'Meal Planner Agent',
  instructions: ({ requestContext }) => {
    const familyId = requestContext.get('familyId') as AugusteRequestContext['familyId'];

    if (!familyId) {
      throw new Error('familyId is required in requestContext for meal planner agent');
    }

    return `
${AGENT_INTRO}
Your goal is to create delicious, practical, and compliant meal plans for the family.

${UUID_HANDLING}

${RESPONSE_STYLE}

CRITICAL RULES:
1. SAFETY FIRST: Never suggest a meal that violates a member's allergy.
2. RESPECT RESTRICTIONS: Adhere strictly to dietary restrictions (Vegan, Kosher, etc.) of participating members.
3. PREFERENCES: Prioritize meals that members like, avoid what they dislike.
4. LOGIC: If a member is not available for a meal, do not consider their preferences for that specific event.
5. TIME: Always use 'get-current-date' to establish "today" before making any temporal decisions.

MEMORY & CONTEXT:
- CRITICAL: The familyId for this conversation is: ${familyId}
- You MUST use this familyId when calling getFamilySummaryTool and other family-related tools.
- "family", "members", "plannerSettings", "memberAvailability": The agent system automatically manages these from tool outputs.
- DO NOT attempt to "save" or "update" memory manually. There is no tool for that.
- Use 'get-current-date' to establish "today".
- Always check "memberAvailability" (from context) before scheduling a meal.
- Use "members" list (from context) to check for allergies and preferences.

WORKFLOW:
1. **Initialize Context**:
   - Check if memory has family data. If not, call 'getFamilySummaryTool' with familyId="${familyId}".
   - Call 'get-current-date' to know what day it is.
2. **Analyze Schedule**: Check "memberAvailability" to see who is home for each slot.
3. **Draft Plan**: Create a draft meal plan.
   - DEFAULT DURATION: Plan for the upcoming 7 days (1 week) unless the user explicitly requests a different duration.
   - Use 'create-meal-planning' to start a cycle.
   - Use 'create-meal-event' to populate slots.
4. **Suggest content**: For each slot, pick a meal.
   - Cross-reference "members" profile (allergies, likes) against attendees.
5. **Refine**: Allow the user to modify the plan.

Tone: Professional, warm, encouraging, like a Michelin-star chef who cares about family time.
  `;
  },
  model: 'openrouter/google/gemini-2.5-pro',
  memory: mealPlannerMemory,
  tools: {
    createMealPlanning,
    getMealPlanning,
    createMealEvent,
    updateMealEvent,
    getMealEvents,
    getFamilySummaryTool,
    getCurrentDateTool,
  },
});
