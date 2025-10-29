import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const UV_Home: React.FC = () => {
  // Zustand state selectors (CRITICAL: individual property access)
  const is_authenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const is_loading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const error_message = useAppStore(state => state.authentication_state.error_message);
  const check_auth = useAppStore(state => state.check_auth);
  const clear_auth_error = useAppStore(state => state.clear_auth_error);
  
  const navigate = useNavigate();

  // Handle authentication check on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await check_auth();
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSession();
  }, [check_auth]);

  // Handle "Play Now" button click
  const handlePlayNow = () => {
    clear_auth_error();
    if (is_authenticated) {
      navigate('/game-lobby');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white sm:py-20">
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-50 to-indigo-100"></div>
          
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center md:text-left lg:grid lg:grid-cols-2 gap-12 lg:items-center">
              {/* Content Column */}
              <div className="mt-16 lg:mt-0">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight sm:leading-tight">
                  <span className="block">Welcome to Fun-Game</span>
                  <span className="block text-blue-600">Match. Score. Share.</span>
                </h1>
                
                <div className="mt-12 space-y-4">
                  <p className="text-xl text-gray-600">
                    The ultimate casual puzzle experience with progressive challenges and social sharing
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                    <button
                      onClick={handlePlayNow}
                      disabled={is_loading}
                      className="group relative w-auto sm:w-[300px] py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-300 hover:shadow-blue-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-20"
                    >
                      {is_loading? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                          </svg>
                          Authenticating...
                        </span>
                      ) : (
                        'Play Now'
                      )}
                    </button>
                    
                    <a
                      href="#preview"
                      className="group relative w-auto sm:w-[300px] py-4 px-8 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    >
                      <span className="absolute inset-0 z-10 rounded-lg"></span>
                      <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent to-blue-50 rounded-lg transition-all duration-300 group-hover:from-blue-50 group-hover:to-transparent"></div>
                      Watch Preview
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Preview Video Column */}
              <div className="mt-12 lg:mt-0">
                <div className="relative pt-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg shadow-gray-200/50">
                  <div className="absolute inset-0">
                    {/* Using placeholder image as per datamap default */}
                    <img
                      src={import.meta.env.VITE_PREVIEW_VIDEO_URL || 'https://picsum.photos/1920/1080?random=1'}
                      alt="Game Preview"
                      className="absolute inset-0 w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Status Section */}
        {error_message && (
          <div className="bg-red-50 border border-red-200 p-4 mx-auto max-w-3xl mt-8 rounded-lg">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-700 mr-3" fill="none" viewBox="0 0 24 24">
                <path d="M12 8v2m0 4v2m0-6v2m9-3a9 9 0 11-18 0 9 9 0 0118 0zm-3 3a6 6 0 11-12 0 6 6 0 0112 0zM7 17v5a1 1 0 002 0v-5a1 1 0 00-2 0zm5 0v5a1 1 0 100-2v-5a1 1 0 00-2 0v5a1 1 0 002 0zm5 0v5a1 1 0 100-2v-5a1 1 0 00-2 0v5a1 1 0 002 0z"></path>
              </svg>
              <p className="text-sm text-red-700">{error_message}</p>
            </div>
          </div>
        )}

        {/* Auth Status Indicator */}
        {is_authenticated && (
          <div className="bg-blue-50 border border-blue-200 p-4 mx-auto max-w-3xl mt-8 rounded-lg text-center">
            <p className="text-blue-700 text-sm">
              You're already authenticated! Click "Play Now" to start a new game.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_Home;