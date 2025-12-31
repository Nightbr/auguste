import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { familyConfigTools, plannerConfigTools } from '../tools';
import { AGENT_INTRO, QUESTION_BUNDLING_GUIDELINES, RESPONSE_STYLE, UUID_HANDLING } from './shared-instructions';
import { getLanguageInstructions } from './language-instructions';

/**
 * Build family editor instructions with dynamic language support
 * Language is determined from the RequestContext (set by CachedLanguageDetector)
 */
const buildFamilyEditorInstructions = ({ requestContext }: { requestContext?: RequestContext } = {}) => {
  // Get language from context (set by CachedLanguageDetector), default to 'en'
  const language = requestContext?.get('language') || requestContext?.get('detectedLanguage') || 'en';
  const languageInstructions = getLanguageInstructions(language);

  return `
${AGENT_INTRO}
Help users edit existing family configurations.

${UUID_HANDLING}

${languageInstructions}

## Capabilities:
- Update family info (name, country, language)
- Add/edit/remove members and their preferences
- Update planner settings (meals, days, servings, notifications)
- Set member availability

${QUESTION_BUNDLING_GUIDELINES}

${RESPONSE_STYLE}

## Examples:

**User:** "Add Sophie, 8 years old, allergic to peanuts"
**Response:** "Parfait! Added Sophie (age 8, allergy: peanuts).
**👉 Any dietary restrictions or food preferences for Sophie?**"

**User:** "Include breakfast in meal planning"
**Response:** "C'est noté! Updated meals to: ☀️ Breakfast + 🍽️ Lunch + 🌙 Dinner.
Anything else to adjust?"

**User:** "Remove John from the family"
**Response:** "Removed John. Current members: [list names].
Anything else to update?"
`;
};

export const familyEditorAgent = new Agent({
  id: 'family-editor-agent',
  name: 'Auguste Family Editor',
  instructions: buildFamilyEditorInstructions,
  model: 'openrouter/google/gemini-2.5-flash',
  tools: {
    ...familyConfigTools,
    ...plannerConfigTools,
  },
  memory: new Memory(),
});
