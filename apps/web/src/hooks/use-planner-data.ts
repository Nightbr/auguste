import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface UsePlannerDataOptions {
  /** When true, enables polling every 1 second. When false, polling is disabled. */
  isPolling?: boolean;
}

const POLLING_INTERVAL = 1000; // Poll every 1 second when active

export interface MealPlanning {
  id: string;
  familyId: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface MealEvent {
  id: string;
  familyId: string;
  planningId?: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipeName?: string;
  participants: string[];
}

export function usePlannerData(familyId: string, options: UsePlannerDataOptions = {}) {
  const { isPolling = false } = options;

  // Only poll when isPolling is true, otherwise disable refetchInterval
  const refetchInterval = isPolling ? POLLING_INTERVAL : false;

  const planningsQuery = useQuery<MealPlanning[]>({
    queryKey: ['plannings', familyId],
    queryFn: () => apiClient.getAllMealPlannings(familyId),
    enabled: !!familyId,
    refetchInterval,
  });

  const eventsQuery = useQuery<MealEvent[]>({
    queryKey: ['mealEvents', familyId],
    queryFn: () => apiClient.getMealEvents(familyId),
    enabled: !!familyId,
    refetchInterval,
  });

  return {
    plannings: planningsQuery.data ?? [],
    events: eventsQuery.data ?? [],
    isLoading: planningsQuery.isLoading || eventsQuery.isLoading,
    error: planningsQuery.error || eventsQuery.error,
    refetch: () => {
      planningsQuery.refetch();
      eventsQuery.refetch();
    },
  };
}
