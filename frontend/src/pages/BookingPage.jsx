import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/translations';
import useBookingsStore from '../stores/bookingsStore';
import useServicesStore from '../stores/servicesStore';
import useAuthStore from '../stores/authStore';
import { Calendar, Clock, DollarSign } from 'lucide-react';

export default function BookingPage({ language = 'en' }) {
  const { t } = useTranslation(language);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { services, fetchServices } = useServicesStore();
  const { createBooking } = useBookingsStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    service_id: parseInt(searchParams.get('service')) || 0,
    booking_datetime: '',
    notes: '',
    payment_method: 'on_site',
    stylist_id: null,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    fetchServices();
  }, [user]);

  const selectedService = services.find(s => s.id === formData.service_id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'service_id' || name === 'stylist_id' ? parseInt(value) || null : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.service_id || !formData.booking_datetime) {
        throw new Error(t('booking_error'));
      }

      const booking = await createBooking(formData);
      
      if (formData.payment_method === 'stripe') {
        navigate(`/payment/${booking.id}`);
      } else {
        navigate('/bookings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">{t('booking_title')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">{t('booking_service')} *</label>
            <select
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            >
              <option value="">-- {t('services_select')} --</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price.toFixed(2)} ({service.duration_minutes}m)
                </option>
              ))}
            </select>
          </div>

          {/* Service Details */}
          {selectedService && (
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">{selectedService.description}</p>
              <div className="flex gap-6 mt-3 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  ${selectedService.price.toFixed(2)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedService.duration_minutes} minutes
                </div>
              </div>
            </div>
          )}

          {/* DateTime */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">{t('booking_date')} {t('booking_time')} *</label>
            <input
              type="datetime-local"
              name="booking_datetime"
              value={formData.booking_datetime}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">{t('booking_notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Any special requests..."
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">{t('booking_payment')} *</label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="payment_method"
                  value="on_site"
                  checked={formData.payment_method === 'on_site'}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="ml-3 text-gray-700">{t('booking_payment_onsite')}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="payment_method"
                  value="stripe"
                  checked={formData.payment_method === 'stripe'}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="ml-3 text-gray-700">{t('booking_payment_stripe')}</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition"
            >
              {t('booking_cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.service_id}
              className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition"
            >
              {isLoading ? t('common_loading') : t('booking_confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
