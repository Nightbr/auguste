/**
 * Language-aware instruction builder for Auguste agents
 * Generates appropriate instructions based on the user's preferred language
 */

export type LanguageCode = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt';

/**
 * Language-specific greeting and personality phrases
 * Maintains Auguste's French culinary personality across all languages
 */
const LANGUAGE_PHRASES: Record<LanguageCode, { greeting: string; wellDone: string[]; please: string; thankYou: string }> = {
  en: {
    greeting: "Bonjour and welcome!",
    wellDone: ["Magnifique!", "Parfait!", "Très bien!", "Excellent!", "Splendid!"],
    please: "Please",
    thankYou: "Thank you",
  },
  fr: {
    greeting: "Bonjour et bienvenue!",
    wellDone: ["Magnifique!", "Parfait!", "Très bien!", "Excellent!", "Formidable!"],
    please: "S'il vous plaît",
    thankYou: "Merci",
  },
  es: {
    greeting: "¡Bonjour y bienvenidos!",
    wellDone: ["¡Magnífico!", "¡Perfecto!", "¡Muy bien!", "¡Excelente!", "¡Espléndido!"],
    please: "Por favor",
    thankYou: "Gracias",
  },
  de: {
    greeting: "Bonjour und willkommen!",
    wellDone: ["Magnifique!", "Parfait!", "Sehr gut!", "Ausgezeichnet!", "Wunderbar!"],
    please: "Bitte",
    thankYou: "Danke schön",
  },
  it: {
    greeting: "Bonjour e benvenuti!",
    wellDone: ["Magnifique!", "Parfait!", "Molto bene!", "Eccellente!", "Splendido!"],
    please: "Per favore",
    thankYou: "Grazie",
  },
  pt: {
    greeting: "Bonjour e bem-vindos!",
    wellDone: ["Magnifique!", "Parfait!", "Muito bem!", "Excelente!", "Esplêndido!"],
    please: "Por favor",
    thankYou: "Obrigado",
  },
};

/**
 * Generate language-aware response style instructions
 */
export function getLanguageInstructions(language: string = 'en'): string {
  const lang = (language in LANGUAGE_PHRASES ? language : 'en') as LanguageCode;
  const phrases = LANGUAGE_PHRASES[lang];

  return `
## Response Language:
- **ALWAYS respond in ${lang.toUpperCase()}** (user's preferred language)
- Keep French culinary terms in their original form: ${phrases.wellDone.slice(0, 3).join(', ')}
- Use ${lang === 'en' ? 'English' : lang} for all explanations, questions, and guidance
- Example phrases to use: "${phrases.wellDone[0]}", "${phrases.wellDone[1]}"
- Greeting format: "${phrases.greeting}"
`;
}

/**
 * Get the localized greeting for a given language
 */
export function getGreeting(language: string = 'en'): string {
  const lang = (language in LANGUAGE_PHRASES ? language : 'en') as LanguageCode;
  return LANGUAGE_PHRASES[lang].greeting;
}
