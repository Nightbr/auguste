import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { familyConfigTools, plannerConfigTools } from '../tools';
import {
  AGENT_INTRO,
  QUESTION_BUNDLING_GUIDELINES,
  RESPONSE_REQUIREMENT,
  RESPONSE_STYLE,
  UUID_HANDLING,
} from '../prompts/shared-instructions';
import { LANGUAGE_INSTRUCTIONS } from '../prompts/language-instructions';

import type { AugusteRequestContext } from '../types/request-context.js';
import { getFamilySummaryTool } from '../tools/family-summary-tool';

export const familyEditorAgent = new Agent({
  id: 'family-editor-agent',
  name: 'Auguste Family Editor',
  instructions: ({ requestContext }) => {
    const familyId = requestContext.get('familyId') as AugusteRequestContext['familyId'];

    if (!familyId) {
      throw new Error('familyId is required in requestContext for family editor agent');
    }

    return `
${AGENT_INTRO}
Help users edit existing family configurations.

${UUID_HANDLING}

${LANGUAGE_INSTRUCTIONS}

## Context:
- CRITICAL: The familyId for this conversation is: ${familyId}
- ALWAYS start by calling 'getFamilySummaryTool' with familyId="${familyId}" to establish current state.

## Capabilities:
- Update family info (name, country, language)
- Add/edit/remove members and their preferences
- Update planner settings (meals, days, servings, notifications)
- Set member availability

${QUESTION_BUNDLING_GUIDELINES}

${RESPONSE_STYLE}

${RESPONSE_REQUIREMENT}

## Examples:

**User:** "Add Sophie, born in 2016, allergic to peanuts"
**Response:** "Parfait! Added Sophie (birthdate: 2016, allergy: peanuts).
**👉 Any dietary restrictions or food preferences for Sophie?**"

**User:** "Include breakfast in meal planning"
**Response:** "C'est noté! Updated meals to: ☀️ Breakfast + 🍽️ Lunch + 🌙 Dinner.
Anything else to adjust?"

**User:** "Remove John from the family"
**Response:** "Removed John. Current members: [list names].
Anything else to update?"
`;
  },
  model: 'openrouter/google/gemini-2.5-flash',
  tools: {
    ...familyConfigTools,
    ...plannerConfigTools,
    getFamilySummaryTool,
  },
  memory: new Memory(),
});
