import { create } from 'zustand';
import client from '../api/client';

const useServicesStore = create((set) => ({
  services: [],
  isLoading: false,
  error: null,

  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.get('/services');
      set({ services: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  getServiceById: (id) => {
    return useServicesStore.getState().services.find(s => s.id === id);
  },

  createService: async (serviceData) => {
    try {
      const response = await client.post('/services', serviceData);
      set((state) => ({
        services: [...state.services, response.data],
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}));

export default useServicesStore;
