import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { useTranslation } from '../i18n/translations';

export default function LoginPage({ language = 'en' }) {
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError(useAuthStore.getState().error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">{t('auth_login_title')}</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">{t('auth_email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">{t('auth_password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            {isLoading ? t('common_loading') : t('auth_login_btn')}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {t('auth_no_account')}{' '}
          <a href="/register" className="text-purple-600 font-semibold hover:underline">
            {t('auth_register_btn')}
          </a>
        </p>

        {/* Demo accounts */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">Demo Accounts:</p>
          <p className="text-xs text-gray-600">Client: client@salon.com / password123</p>
          <p className="text-xs text-gray-600">Admin: admin@salon.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
