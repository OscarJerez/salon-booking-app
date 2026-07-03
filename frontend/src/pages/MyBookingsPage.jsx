import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/translations';
import useBookingsStore from '../stores/bookingsStore';
import useAuthStore from '../stores/authStore';
import { Calendar, Trash2, CreditCard } from 'lucide-react';

export default function MyBookingsPage({ language = 'en' }) {
  const { t } = useTranslation(language);
  const { bookings, fetchBookings, cancelBooking, isLoading } = useBookingsStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const handleCancel = async (bookingId) => {
    if (window.confirm(t('common_confirm'))) {
      await cancelBooking(bookingId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">{t('bookings_title')}</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <p className="text-center text-gray-600">{t('common_loading')}</p>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{t('bookings_empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('bookings_service')}</p>
                    <p className="font-bold text-gray-800">{booking.service.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('bookings_date')}</p>
                    <p className="font-bold text-gray-800">
                      {new Date(booking.booking_datetime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('bookings_amount')}</p>
                    <p className="font-bold text-purple-600">${booking.service.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('bookings_status')}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-4 flex-wrap">
                  {!booking.is_paid && booking.payment_method === 'stripe' && booking.status === 'pending' && (
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                      <CreditCard className="w-4 h-4" />
                      {t('bookings_pay')}
                    </button>
                  )}
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('bookings_cancel')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
