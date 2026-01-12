import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useFamilyData(familyId: string) {
  const familyQuery = useQuery({
    queryKey: ['family', familyId],
    queryFn: () => apiClient.getFamily(familyId),
    enabled: !!familyId,
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const membersQuery = useQuery({
    queryKey: ['members', familyId],
    queryFn: () => apiClient.getMembers(familyId),
    enabled: !!familyId,
    refetchInterval: 5000,
  });

  const availabilityQuery = useQuery({
    queryKey: ['availability', familyId],
    queryFn: () => apiClient.getAvailability(familyId),
    enabled: !!familyId,
    refetchInterval: 5000,
  });

  const settingsQuery = useQuery({
    queryKey: ['settings', familyId],
    queryFn: () => apiClient.getSettings(familyId),
    enabled: !!familyId,
    refetchInterval: 5000,
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
