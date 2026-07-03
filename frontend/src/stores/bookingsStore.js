import { create } from 'zustand';
import client from '../api/client';

const useBookingsStore = create((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.get('/bookings');
      set({ bookings: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createBooking: async (bookingData) => {
    try {
      const response = await client.post('/bookings', bookingData);
      set((state) => ({
        bookings: [...state.bookings, response.data],
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      await client.put(`/bookings/${bookingId}/cancel`);
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  getBookingById: (id) => {
    return useBookingsStore.getState().bookings.find(b => b.id === id);
  },
}));

export default useBookingsStore;
