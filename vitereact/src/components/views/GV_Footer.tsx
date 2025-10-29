import React from 'react';
import { Link } from 'react-router-dom';

const GV_Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left Section */}
          <div className="mb-6 md:mb-0">
            <div className="text-sm font-medium text-gray-700">
              <Link to="/about" className="hover:text-blue-600 mr-4">
                About
              </Link>
              <Link to="/contact" className="hover:text-blue-600 mr-4">
                Contact
              </Link>
              <Link to="/privacy" className="hover:text-blue-600 mr-4">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-blue-600">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="text-sm text-gray-500">
            <div className="flex space-x-4">
              {/* Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 0-3.06 1.71 10.53 10.53 0 0 1-6.34 0 10.74 10.74 0 0 1-3.18 1.79 4.48 4.48 0 0 1-.5 2.01C15.31 7.48 13.6 6 12 6c-1.6 0-2.31 1.48-2.31 3.3a4.53 4.53 0 0 0.27 2.1 8.2 8.2 0 0 1 4.8 0c1.6 0 3.09-.8 4.1-2.08a4.8 4.8 0 0 0 1.63-3.63 9.42 9.42 0 0 0-7.38 2.2A9.34 9.34 0 0 1 0 4C0 7.64 3.35 9 6.62 9c1.28 0 2.4-.2 3.5-.57a4.52 4.52 0 0 1 3.6 1.53c-1.04 3.37-3.4 5.74-6.6 6.84a13.38 13.38 0 0 1-4.42-.27c-6.6 0-7.9 5.2-6.5 11.2a4.5 4.5 0 0 0 1.8 2.2 8.9 8.9 0 0 1 7.7-3.79 14.7 14.7 0 0 1 4.48 6.49 4.34 13.38 0 0 1-8.6 1.74a4.48 4.48 0 0 1-2.34-2.1z"/>
                </svg>
              </a>
              
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M23.25 16.59c-.59-.59-1.15-1.24-1.84-1.81h3.1v-5.88c-.08-.37-.4-.67-.85-.74a3.14 3.14 0 0 0-1.14.02 3.14 3.14 0 0 0-2.6 2.6 3.14 3.14 0 0 0 0 5.76c0 3.37-1.33 6.14-3.4 8.28a8.53 8.53 0 0 1-7.22-2.21h2.55l-.46 2.25a8.81 8.81 0 0 1-6.75 0l-.46-2.25h2.55a8.53 8.53 0 0 0 7.22 2.21 8.53 8.53 0 0 0 3.4-8.28 8.53 8.53 0 0 0-5.76 0c-.47 0-.94.06-1.38.17v-2.33c0-1.8.5-3.5 1.5-4.7a3.14 3.14 0 0 1 3.4 0c.47.27.87.58 1.27.93a3.14 3.14 0 0 1-1.51 2.77 3.14 3.14 0 0 1-2.6-2.6z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="mt-6 text-center text-xs text-gray-500">
          &copy; {currentYear} Fun-Game. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default GV_Footer;