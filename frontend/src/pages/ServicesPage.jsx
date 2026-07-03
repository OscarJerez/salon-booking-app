import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/translations';
import useServicesStore from '../stores/servicesStore';
import { Sparkles } from 'lucide-react';

export default function ServicesPage({ language = 'en' }) {
  const { t } = useTranslation(language);
  const { services, fetchServices, isLoading } = useServicesStore();
  const [category, setCategory] = useState('all');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (category === 'all') {
      setFiltered(services);
    } else {
      setFiltered(services.filter(s => s.category === category));
    }
  }, [services, category]);

  const categories = ['all', ...new Set(services.map(s => s.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">{t('services_title')}</h1>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                category === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {cat === 'all' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <p className="text-center text-gray-600">{t('common_loading')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                  <Sparkles className="w-8 h-8 mb-2" />
                  <h3 className="text-2xl font-bold">{service.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-sm text-gray-500">{t('services_price')}</p>
                      <p className="text-3xl font-bold text-purple-600">${service.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{t('services_duration')}</p>
                      <p className="text-3xl font-bold text-blue-600">{service.duration_minutes}'</p>
                    </div>
                  </div>
                  <a
                    href={`/booking?service=${service.id}`}
                    className="w-full block text-center bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    {t('services_book')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
