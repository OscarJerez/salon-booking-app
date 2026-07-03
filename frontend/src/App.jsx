import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import { useTranslation } from './i18n/translations';
import { Menu, X, Globe, LogOut, LogIn } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  const navigate = useNavigate();
  const { user, token, logout, setLanguage } = useAuthStore();
  const [language, setLanguageLoc] = useState(localStorage.getItem('language') || 'en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    localStorage.setItem('language', language);
    setLanguage(language);
  }, [language]);

  const { t } = useTranslation(language);

  // Simple router
  const handleNavigate = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'services':
        return <ServicesPage language={language} />;
      case 'booking':
        return <BookingPage language={language} />;
      case 'bookings':
        return user ? <MyBookingsPage language={language} /> : <LoginPage language={language} />;
      case 'admin':
        return user && user.role === 'admin' ? <AdminDashboardPage language={language} /> : <HomePage language={language} />;
      case 'login':
        return <LoginPage language={language} />;
      case 'register':
        return <RegisterPage language={language} />;
      default:
        return <HomePage language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => handleNavigate('home')}
            className="text-2xl font-bold text-purple-600"
          >
            💇 {t('header_title')}
          </button>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigate('home')}
              className="text-gray-700 hover:text-purple-600 font-semibold transition"
            >
              {t('header_home')}
            </button>
            <button
              onClick={() => handleNavigate('services')}
              className="text-gray-700 hover:text-purple-600 font-semibold transition"
            >
              {t('header_services')}
            </button>
            {user && (
              <>
                <button
                  onClick={() => handleNavigate('bookings')}
                  className="text-gray-700 hover:text-purple-600 font-semibold transition"
                >
                  {t('header_bookings')}
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="text-gray-700 hover:text-purple-600 font-semibold transition"
                  >
                    {t('header_admin')}
                  </button>
                )}
              </>
            )}

            {/* Language Selector */}
            <div className="flex items-center gap-2 border-l pl-6">
              <Globe className="w-4 h-4" />
              <select
                value={language}
                onChange={(e) => setLanguageLoc(e.target.value)}
                className="bg-transparent cursor-pointer text-sm font-semibold"
              >
                <option value="en">English</option>
                <option value="sv">Svenska</option>
              </select>
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-4 border-l pl-6">
                <span className="text-sm text-gray-600">
                  {user.first_name} {user.last_name}
                </span>
                <button
                  onClick={() => {
                    logout();
                    handleNavigate('home');
                  }}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  {t('header_logout')}
                </button>
              </div>
            ) : (
              <div className="flex gap-3 border-l pl-6">
                <button
                  onClick={() => handleNavigate('login')}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
                >
                  <LogIn className="w-4 h-4" />
                  {t('header_login')}
                </button>
                <button
                  onClick={() => handleNavigate('register')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  {t('header_register')}
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-4">
            <button
              onClick={() => handleNavigate('home')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {t('header_home')}
            </button>
            <button
              onClick={() => handleNavigate('services')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {t('header_services')}
            </button>
            {user && (
              <>
                <button
                  onClick={() => handleNavigate('bookings')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  {t('header_bookings')}
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  >
                    {t('header_admin')}
                  </button>
                )}
              </>
            )}

            <div className="border-t pt-4">
              <select
                value={language}
                onChange={(e) => setLanguageLoc(e.target.value)}
                className="w-full px-4 py-2 border rounded text-sm"
              >
                <option value="en">English</option>
                <option value="sv">Svenska</option>
              </select>
            </div>

            {user ? (
              <button
                onClick={() => {
                  logout();
                  handleNavigate('home');
                }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
              >
                {t('header_logout')}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('login')}
                  className="block w-full text-left px-4 py-2 text-purple-600 hover:bg-purple-50 rounded"
                >
                  {t('header_login')}
                </button>
                <button
                  onClick={() => handleNavigate('register')}
                  className="block w-full text-left px-4 py-2 bg-purple-600 text-white rounded"
                >
                  {t('header_register')}
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-20 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2026 Salon Booking System. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Professional salon booking made easy.</p>
        </div>
      </footer>
    </div>
  );
}
