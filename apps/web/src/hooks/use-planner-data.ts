import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface UsePlannerDataOptions {
  /** When true, enables polling every 1 second. When false, polling is disabled. */
  isPolling?: boolean;
}

const POLLING_INTERVAL = 1000; // Poll every 1 second when active

export function usePlannerData(familyId: string, options: UsePlannerDataOptions = {}) {
  const { isPolling = false } = options;

  // Only poll when isPolling is true, otherwise disable refetchInterval
  const refetchInterval = isPolling ? POLLING_INTERVAL : false;

  const planningQuery = useQuery({
    queryKey: ['planning', familyId],
    queryFn: () => apiClient.getMealPlanning(familyId),
    enabled: !!familyId,
    refetchInterval,
  });

  const eventsQuery = useQuery({
    queryKey: ['mealEvents', familyId],
    queryFn: () => apiClient.getMealEvents(familyId),
    enabled: !!familyId,
    refetchInterval,
  });

  return {
    planning: planningQuery.data,
    events: eventsQuery.data,
    isLoading: planningQuery.isLoading || eventsQuery.isLoading,
    error: planningQuery.error || eventsQuery.error,
    refetch: () => {
      planningQuery.refetch();
      eventsQuery.refetch();
    },
  };
}

