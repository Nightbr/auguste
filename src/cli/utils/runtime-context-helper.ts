/**
 * Runtime context helper for Auguste agents
 * Sets up RequestContext with family-specific data for dynamic agent behavior
 */

import { RequestContext } from '@mastra/core/request-context';
import { getDatabase } from '../../domain';

/**
 * Set up runtime context from family data
 * Call this before agent.generate() to customize agent behavior for the family
 *
 * @param requestContext - The RequestContext instance to populate
 * @param familyId - The family ID to load data from
 */
export async function setupRuntimeContextForFamily(
  requestContext: RequestContext,
  familyId: string
): Promise<void> {
  const db = getDatabase();
  const family = db
    .prepare('SELECT * FROM Family WHERE id = ?')
    .get(familyId) as { id: string; name: string; country: string; language: string } | undefined;

  if (!family) {
    // Family not found - use defaults
    requestContext.set('language', 'en');
    requestContext.set('country', 'US');
    requestContext.set('familyName', undefined);
    return;
  }

  // Set family-specific context
  requestContext.set('language', family.language);
  requestContext.set('country', family.country);
  requestContext.set('familyName', family.name);
}

/**
 * Clear runtime context (useful for testing or switching families)
 *
 * @param requestContext - The RequestContext instance to clear
 */
export function clearRuntimeContext(requestContext: RequestContext): void {
  requestContext.delete('language');
  requestContext.delete('country');
  requestContext.delete('familyName');
}
