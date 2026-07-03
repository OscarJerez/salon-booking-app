import { create } from 'zustand';
import client from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/login', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      const userResponse = await client.get('/auth/me');
      set({ user: userResponse.data, token: access_token, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Login failed', isLoading: false });
      return false;
    }
  },

  register: async (email, password, firstName, lastName, phoneNumber, preferredLanguage = 'en') => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        preferred_language: preferredLanguage,
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      const userResponse = await client.get('/auth/me');
      set({ user: userResponse.data, token: access_token, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Registration failed', isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setLanguage: async (language) => {
    if (useAuthStore.getState().user) {
      useAuthStore.getState().user.preferred_language = language;
    }
  },
}));

export default useAuthStore;
