import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UV_Terms: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button
                type="button"
                onClick={handleBack}
                className="text-gray-700 hover:text-gray-900 flex items-center"
                aria-label="Go back"
              >
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                  <path d="M15 19l-9-9m0 0l-6 6m6-6l6-6" stroke="currentColor" strokeWidth="2" />
                </svg>
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900">1. Introduction</h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  By accessing or using Fun-Game services, you agree to be bound by these Terms of Service
                  ("Terms"). Please read them carefully before using our services.
                </p>
              </section>

              {/* User Responsibilities */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900">2. User Responsibilities</h2>
                <ul className="mt-4 space-y-2 text-gray-700">
                  <li className="pl-6 pr-4">
                    <span className="absolute inline-block ml-2 w-2 h-2 rounded-full bg-gray-500"></span>
                    You must be at least 13 years old to use our services.
                  </li>
                  <li className="pl-6 pr-4">
                    <span className="absolute inline-block ml-2 w-2 h-2 rounded-full bg-gray-500"></span>
                    You are responsible for maintaining the confidentiality of your account credentials.
                  </li>
                  <li className="pl-6 pr-4">
                    <span className="absolute inline-block ml-2 w-2 h-2 rounded-full bg-gray-500"></span>
                    You must not use our services for any illegal purposes.
                  </li>
                </ul>
              </section>

              {/* Account Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900">3. Account Termination</h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate your account if we determine you've violated
                  these Terms. You may terminate your account at any time through your profile settings.
                </p>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900">4. Intellectual Property</h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  All content, trademarks, and intellectual property on Fun-Game are owned by the company
                  and protected by applicable laws. You may not use our IP without authorization.
                </p>
              </section>

              {/* Acceptance */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900">5. Acceptance</h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  By using our services, you acknowledge that you have read, understood, and agree to be bound
                  by these Terms. If you do not agree, you must not use our services.
                </p>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Version 1.0 • Last updated: October 2023
                </p>
                <div className="mt-4 space-x-6">
                  <Link
                    to="/"
                    className="text-blue-600 hover:text-blue-700 inline-block"
                    aria-label="Return to homepage"
                  >
                    Homepage
                  </Link>
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 inline-block"
                    aria-label="Proceed to login"
                  >
                    Continue to Game
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="bg-gray-50 py-6 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-6">
              <Link to="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-gray-900 font-medium">
                Terms
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default UV_Terms;