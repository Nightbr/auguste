import { useMemo } from 'react';
import { useFamilyData } from './use-family-data';

/**
 * Hook to check if a family is ready for meal planning.
 *
 * A family is considered "ready" when:
 * 1. At least one member exists
 * 2. mealTypes array has at least one value
 * 3. activeDays array has at least one value
 */
export function useFamilyReady(familyId: string | null) {
  const { members, settings, isLoading } = useFamilyData(familyId || '', {
    isPolling: false,
  });

  const isReady = useMemo(() => {
    // If still loading or no familyId, not ready
    if (!familyId || isLoading) {
      return false;
    }

    // Check at least one member
    if (!members || members.length === 0) {
      return false;
    }

    // Check mealTypes has at least one value
    if (!settings?.mealTypes || settings.mealTypes.length === 0) {
      return false;
    }

    // Check activeDays has at least one value
    if (!settings?.activeDays || settings.activeDays.length === 0) {
      return false;
    }

    return true;
  }, [familyId, members, settings, isLoading]);

  return {
    isReady,
    isLoading,
    // Provide specific readiness details for UI feedback
    hasMembers: (members?.length ?? 0) > 0,
    hasMealTypes: (settings?.mealTypes?.length ?? 0) > 0,
    hasActiveDays: (settings?.activeDays?.length ?? 0) > 0,
  };
}

