/**
 * Helper functions for calling the meal planner agent with familyId
 */

import { RequestContext } from '@mastra/core/request-context';
import { randomUUID } from 'crypto';
import { mealPlannerAgent } from './meal-planner-agent';
import type { AugusteRequestContext } from '../types/request-context.js';

/**
 * Options for calling the meal planner agent
 */
export interface MealPlannerOptions {
  /**
   * The family ID to create a meal plan for
   */
  familyId: string;

  /**
   * Optional thread ID for conversation continuity
   * If not provided, a new thread will be created
   */
  threadId?: string;

  /**
   * Optional additional request context
   */
  requestContext?: RequestContext<AugusteRequestContext>;
}

/**
 * Call the meal planner agent with a familyId
 *
 * This helper function sets up the proper memory scoping and request context
 * to ensure the agent has access to the family's data.
 *
 * @param message - The message to send to the agent
 * @param options - Options including familyId and optional threadId
 * @returns The agent's response
 *
 * @example
 * ```typescript
 * const response = await callMealPlannerAgent(
 *   'Create a meal plan for next week',
 *   { familyId: 'abc-123' }
 * );
 * console.log(response.text);
 * ```
 */
export async function callMealPlannerAgent(
  message: string,
  options: MealPlannerOptions,
): Promise<any> {
  const {
    familyId,
    threadId = randomUUID(),
    requestContext = new RequestContext<AugusteRequestContext>(),
  } = options;

  // Set familyId in request context for tools to access
  requestContext.set('familyId', familyId);

  return await mealPlannerAgent.generate(message, {
    memory: {
      thread: threadId,
      resource: familyId, // Scope memory to this family
    },
    requestContext,
  });
}
