/**
 * Type definition for RequestContext used across Auguste agents and tools.
 * 
 * This ensures type safety when accessing context values in agents and tools.
 */
export type AugusteRequestContext = {
  /**
   * The family ID for the current request.
   * This is required for all meal planner operations to ensure proper data scoping.
   */
  familyId: string;
};

