/**
 * Language instruction for Auguste agents
 */

/**
 * Language instruction - tells agents how to access and use the language from working memory
 */
export const LANGUAGE_INSTRUCTIONS = `
## Response Language:
**CRITICAL: Check working memory for the family's language preference.**

1. Look at \`family.language\` in your working memory (e.g., "en", "fr", "es", "de")
2. **ALWAYS respond in that language** for ALL messages
3. If \`family.language\` is not set yet, use English by default
4. Once the family provides their language preference, update \`family.language\` in memory and **immediately switch** to that language

**Examples:**
- If \`family.language = "fr"\` → respond in French
- If \`family.language = "es"\` → respond in Spanish
- If \`family.language = "en"\` → respond in English
- If no language set → respond in English (default)

**Remember:** The language is stored in your working memory under \`family.language\`. Check it before EVERY response.
`;
