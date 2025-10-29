import React, { useState } from 'react';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

const UV_Authentication: React.FC = () => {
  // Zustand state and methods
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const errorMessage = useAppStore(state => state.authentication_state.error_message);
  const loginUser = useAppStore(state => state.login_user);
  const registerUser = useAppStore(state => state.register_user);
  const clearAuthError = useAppStore(state => state.clear_auth_error);

  // Local form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    
    try {
      if (isRegisterMode) {
        await registerUser(email, password, name);
      } else {
        await loginUser(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  // Handle input changes with error clearing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearAuthError();
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'name') setName(value);
  };

  // Toggle between login and register modes
  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    clearAuthError();
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isRegisterMode? 'Create your account' : 'Sign in to your account'}
          </h2>
          
          {/* Error message display */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Social media buttons */}
            <div className="space-y-2">
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <span className="mr-2">G</span>
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-gray-100 hover:bg-gray-200"
              >
                <span className="mr-2">f</span>
                Continue with Facebook
              </button>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

            {/* Name field (only in register mode) */}
            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            )}

            {/* Password field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegisterMode? "new-password" : "current-password"}
                required
                value={password}
                onChange={handleInputChange}
                placeholder="Password"
                className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

            {/* Forgot password link */}
            <div className="text-sm flex justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="block text-right text-sm">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isRegisterMode? 'Creating account...' : 'Signing in...'}
                  </span>
                ) : (
                  isRegisterMode? 'Create account' : 'Sign in'
                )}
              </button>
            </div>

            {/* Mode toggle */}
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-500"
              >
                {isRegisterMode 
                 ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UV_Authentication;