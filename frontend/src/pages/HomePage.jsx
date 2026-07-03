import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/translations';
import useServicesStore from '../stores/servicesStore';
import useAuthStore from '../stores/authStore';
import { Calendar, MapPin, Sparkles } from 'lucide-react';

export default function HomePage({ language = 'en' }) {
  const { t } = useTranslation(language);
  const { services, fetchServices } = useServicesStore();
  const { user } = useAuthStore();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    setFeatured(services.slice(0, 3));
  }, [services]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">{t('home_title')}</h1>
          <p className="text-xl mb-8 opacity-90">{t('home_subtitle')}</p>
          <a
            href="/booking"
            className="inline-block bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
          >
            {t('home_book_now')}
          </a>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">{t('home_featured_services')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6">
                <Sparkles className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-800">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">${service.price}</span>
                  <span className="text-sm text-gray-500">{service.duration_minutes} {t('services_minutes')}</span>
                </div>
                <a
                  href={`/booking?service=${service.id}`}
                  className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 transition text-center block"
                >
                  {t('services_book')}
                </a>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="/services"
              className="inline-block text-purple-600 font-bold text-lg hover:underline"
            >
              {t('home_view_all')} →
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2 text-gray-800">Easy Booking</h3>
              <p className="text-gray-600">Book your appointment in just a few clicks</p>
            </div>
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2 text-gray-800">Professional Services</h3>
              <p className="text-gray-600">Expert stylists ready to serve you</p>
            </div>
            <div className="text-center">
              <MapPin className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2 text-gray-800">Convenient Location</h3>
              <p className="text-gray-600">Accessible salon with modern facilities</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
