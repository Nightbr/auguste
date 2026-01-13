import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface UseFamilyDataOptions {
  /** When true, enables polling every 1 second. When false, polling is disabled. */
  isPolling?: boolean;
}

const POLLING_INTERVAL = 1000; // Poll every 1 second when active

export function useFamilyData(familyId: string, options: UseFamilyDataOptions = {}) {
  const { isPolling = false } = options;

  // Only poll when isPolling is true, otherwise disable refetchInterval
  const refetchInterval = isPolling ? POLLING_INTERVAL : false;

  const familyQuery = useQuery({
    queryKey: ['family', familyId],
    queryFn: () => apiClient.getFamily(familyId),
    enabled: !!familyId,
    refetchInterval,
  });

  const membersQuery = useQuery({
    queryKey: ['members', familyId],
    queryFn: () => apiClient.getMembers(familyId),
    enabled: !!familyId,
    refetchInterval,
  });

  const availabilityQuery = useQuery({
    queryKey: ['availability', familyId],
    queryFn: () => apiClient.getAvailability(familyId),
    enabled: !!familyId,
    refetchInterval,
  });

  const settingsQuery = useQuery({
    queryKey: ['settings', familyId],
    queryFn: () => apiClient.getSettings(familyId),
    enabled: !!familyId,
    refetchInterval,
  });

  return {
    family: familyQuery.data,
    members: membersQuery.data,
    availability: availabilityQuery.data,
    settings: settingsQuery.data,
    isLoading:
      familyQuery.isLoading ||
      membersQuery.isLoading ||
      availabilityQuery.isLoading ||
      settingsQuery.isLoading,
    error:
      familyQuery.error || membersQuery.error || availabilityQuery.error || settingsQuery.error,
    refetch: () => {
      familyQuery.refetch();
      membersQuery.refetch();
      availabilityQuery.refetch();
      settingsQuery.refetch();
    },
  };
}
