import React from 'react';
import { Link } from 'react-router-dom';

const UV_Privacy: React.FC = () => {
  // Privacy policy content structured with HTML elements
  const privacyPolicyContent = (
    <>
      <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-6">
        Privacy Policy
      </h1>

      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          1. Introduction
        </h3>
        <p className="text-base text-gray-600 leading-relaxed">
          At Fun-Game, we value your privacy and are committed to protecting your personal information. 
          This policy outlines how we collect, use, and safeguard your data in compliance with GDPR and CCPA regulations.
        </p>
      </section>

      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          2. Data Collection
        </h3>
        <p className="text-base text-gray-600 leading-relaxed mb-3">
          We may collect the following information:
        </p>
        <ul className="list-disc list-inside text-gray-600">
          <li>Username and email address for account creation</li>
          <li>Game performance data for leaderboard rankings</li>
          <li>Device information for security and analytics</li>
        </ul>
      </section>

      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          3. Data Usage
        </h3>
        <p className="text-base text-gray-600 leading-relaxed">
          Your data is used solely for:
        </p>
        <ul className="list-disc list-inside text-gray-600">
          <li>Providing and improving gameplay experiences</li>
          <li>Authenticating users and preventing fraud</li>
          <li>Complying with legal requirements</li>
        </ul>
      </section>

      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          4. Data Protection
        </h3>
        <p className="text-base text-gray-600 leading-relaxed">
          We implement strict security measures including:
        </p>
        <ul className="list-disc list-inside text-gray-600">
          <li>End-to-end encryption for data transmission</li>
          <li>Regular security audits and vulnerability testing</li>
          <li>Compliance with international data protection standards</li>
        </ul>
      </section>

      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          5. User Rights
        </h3>
        <p className="text-base text-gray-600 leading-relaxed">
          You have the right to:
        </p>
        <ul className="list-disc list-inside text-gray-600">
          <li>Access your personal data</li>
          <li>Request data correction or deletion</li>
          <li>Opt out of data collection where applicable</li>
        </ul>
      </section>

      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          6. Policy Updates
        </h3>
        <p className="text-base text-gray-600 leading-relaxed">
          We may update this policy periodically. Material changes will be notified via:
        </p>
        <ul className="list-disc list-inside text-gray-600">
          <li>In-app notifications</li>
          <li>Email to registered accounts</li>
        </ul>
      </section>

      <div className="text-center mt-12">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Homepage
        </Link>
      </div>
    </>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="relative flex-1 overflow-y-auto p-6 sm:px-6 lg:px-8">
          <div className="container mx-auto px-4">
            {privacyPolicyContent}
          </div>
        </main>
      </div>
    </>
  );
};

export default UV_Privacy;