import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const GV_TopNavigation: React.FC = () => {
  // Zustand state access (individual selectors)
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const logoutUser = useAppStore(state => state.logout_user);
  
  // Local state for mobile menu
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Handle click outside for profile dropdown
  const handleDocumentClick = (e: React.MouseEvent<Document>) => {
    if (!isProfileDropdownOpen) return;
    setProfileDropdownOpen(false);
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logoutUser();
    }
  };

  // Navigation links
  const navLinks = [
    { name: 'Profile', href: '/profile', icon: 'user' },
    { name: 'Settings', href: '/settings', icon: 'cog' },
    { name: 'Logout', onClick: handleLogout, icon: 'sign-out' },
  ];

  // Profile picture fallback
  const profilePicture = currentUser?.profile_picture 
   ? `${import.meta.env.VITE_API_BASE_URL}/images/${currentUser.profile_picture}`
    : '/default-avatar.png';

  return (
    <>
      {/* Mobile menu toggle listener */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-30"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      <header className="fixed w-full z-50 bg-white shadow-lg transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link
                to="/game-lobby"
                className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Fun-Game
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated? (
                <>
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-all"
                      onClick={() => setProfileDropdownOpen(prev =>!prev)}
                      aria-haspopup="true"
                      aria-expanded={isProfileDropdownOpen}
                    >
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{currentUser?.name}</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {navLinks.map((link, index) => (
                          <Link
                            key={index}
                            to={link.href || '#'}
                            onClick={link.onClick || (() => {})}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-x-3">
                  <Link
                    to="/auth"
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/auth"
                    className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              {isAuthenticated? (
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 transition-all"
                  onClick={() => setMobileMenuOpen(prev =>!prev)}
                  aria-label="Toggle main navigation"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isMobileMenuOpen? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18.75 6.75M6.75 17.25L17.25 6.75" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m0 6h16" />
                    )}
                  </svg>
                </button>
              ) : (
                <div className="space-x-2">
                  <Link
                    to="/auth"
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/auth"
                    className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && (
          <div
            className={`fixed bottom-0 left-0 w-full bg-white shadow-xl transition-all duration-300 ease-in-out ${
              isMobileMenuOpen? 'h-full' : 'h-0'
            }`}
          >
            <div className="pt-4 px-4 space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href || '#'}
                  onClick={link.onClick || (() => {})}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default GV_TopNavigation;