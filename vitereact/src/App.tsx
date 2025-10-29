import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

// Import all required views
import GV_TopNavigation from '@/components/views/GV_TopNavigation';
import GV_Footer from '@/components/views/GV_Footer';
import UV_Home from '@/components/views/UV_Home';
import UV_Authentication from '@/components/views/UV_Authentication';
import UV_Profile from '@/components/views/UV_Profile';
import UV_GameLobby from '@/components/views/UV_GameLobby';
import UV_Gameplay from '@/components/views/UV_Gameplay';
import UV_Results from '@/components/views/UV_Results';
import UV_About from '@/components/views/UV_About';
import UV_Contact from '@/components/views/UV_Contact';
import UV_Privacy from '@/components/views/UV_Privacy';
import UV_Terms from '@/components/views/UV_Terms';

// Configure QueryClient with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Loading spinner component for auth and data loading states
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Protected route component using Zustand auth state
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use individual selectors to prevent infinite loops
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

// Main App component
const App: React.FC = () => {
  const { check_auth } = useAppStore();
  const location = useLocation();

  // Verify authentication status on mount
  useEffect(() => {
    check_auth();
  }, [check_auth]);

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="App min-h-screen flex flex-col bg-gray-50">
          {/* Conditionally render top navigation except on login page */}
          {location.pathname!== '/login' && <GV_TopNavigation />}

          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={<UV_Home />} 
              />
              <Route 
                path="/login" 
                element={<UV_Authentication />} 
              />
              <Route 
                path="/about" 
                element={<UV_About />} 
              />
              <Route 
                path="/contact" 
                element={<UV_Contact />} 
              />
              <Route 
                path="/privacy" 
                element={<UV_Privacy />} 
              />
              <Route 
                path="/terms" 
                element={<UV_Terms />} 
              />

              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UV_Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/game-lobby" 
                element={
                  <ProtectedRoute>
                    <UV_GameLobby />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gameplay" 
                element={
                  <ProtectedRoute>
                    <UV_Gameplay />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/results" 
                element={
                  <ProtectedRoute>
                    <UV_Results />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all route */}
              <Route 
                path="*" 
                element={<Navigate to="/" replace />} 
              />
            </Routes>
          </main>

          {/* Global footer on all pages */}
          <GV_Footer />
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;