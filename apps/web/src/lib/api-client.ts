const API_BASE_URL = 'http://localhost:3001';

export const apiClient = {
  getFamily: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/family/${id}`);
    if (!response.ok) throw new Error('Failed to fetch family');
    return response.json();
  },
  getMembers: async (familyId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/family/${familyId}/members`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },
  getAvailability: async (familyId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/family/${familyId}/availability`);
    if (!response.ok) throw new Error('Failed to fetch availability');
    return response.json();
  },
  getSettings: async (familyId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/family/${familyId}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },
  createFamily: async (data: { name: string; country: string; language: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create family');
    return response.json();
  },
  // Meal planning endpoints
  getMealPlanning: async (familyId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/family/${familyId}/planning`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch meal planning');
    }
    return response.json();
  },
  getMealEvents: async (familyId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/family/${familyId}/events`);
    if (!response.ok) throw new Error('Failed to fetch meal events');
    return response.json();
  },
};
