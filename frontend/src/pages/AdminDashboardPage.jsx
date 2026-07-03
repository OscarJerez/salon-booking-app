import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/translations';
import useAuthStore from '../stores/authStore';
import client from '../api/client';
import { BarChart3, Users, DollarSign, Calendar } from 'lucide-react';

export default function AdminDashboardPage({ language = 'en' }) {
  const { t } = useTranslation(language);
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchBookings();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await client.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await client.get('/admin/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600 font-semibold">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-gray-800">{t('admin_title')}</h1>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('admin_total_bookings')}</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total_bookings}</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('admin_completed')}</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed_bookings}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('admin_revenue')}</p>
                  <p className="text-3xl font-bold text-blue-600">${stats.total_revenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('admin_users')}</p>
                  <p className="text-3xl font-bold text-pink-600">{stats.users}</p>
                </div>
                <Users className="w-12 h-12 text-pink-600 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* All Bookings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('admin_all_bookings')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">#{booking.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{booking.client.first_name} {booking.client.last_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{booking.service.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(booking.booking_datetime).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">${booking.service.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
