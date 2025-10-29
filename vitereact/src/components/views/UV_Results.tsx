import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import axios from 'axios';
import { VITE_API_BASE_URL } from '@/env';

const UV_Results: React.FC = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  
  // Zustand store selectors (CRITICAL: individual selectors)
  const fetchGame = useAppStore(state => state.fetch_game_state);
  const startNewGame = useAppStore(state => state.start_new_game);
  const auth_token = useAppStore(state => state.authentication_state.auth_token);
  const gameState = useAppStore(state => state.game_state.current_game);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Fetch game data on mount
  useEffect(() => {
    if (!gameId) {
      navigate('/game-lobby');
      return;
    }

    const loadGame = async () => {
      try {
        await fetchGame(gameId);
      } catch (err) {
        setError('Failed to load game results');
      }
    };

    loadGame();
  }, [gameId, fetchGame, navigate]);

  // Handle retry action
  const handleRetry = async () => {
    if (!gameState?.difficulty) return;
    
    try {
      await startNewGame(gameState.difficulty);
      navigate('/gameplay');
    } catch (err) {
      setError('Failed to start new game');
    }
  };

  // Handle social sharing
  const handleShare = async (platform: 'twitter' | 'facebook') => {
    if (!auth_token ||!gameState?.score) return;
    
    setShareStatus('idle');
    try {
      // Call sharing API
      await axios.post(
        `${VITE_API_BASE_URL || 'http://localhost:3000'}api/shares`,
        {
          score: gameState.score,
          platform,
        },
        {
          headers: {
            Authorization: `Bearer ${auth_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Open shareable link in new tab
      const shareUrl = `https://fun-game.com/share?score=${gameState.score}`;
      window.open(shareUrl, '_blank');
      
      setShareStatus('success');
      setTimeout(() => setShareStatus('idle'), 3000);
    } catch (err) {
      setShareStatus('error');
      setError('Sharing failed. Please try again.');
    }
  };

  // Loading state
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-6 lg:p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Game Results</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Score */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Final Score</h3>
                <div className="text-3xl font-bold text-gray-900">{gameState.score} points</div>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Time Remaining</h3>
                <div className="text-3xl font-bold text-gray-900">{gameState.time_remaining}s</div>
              </div>
            </div>

            {/* Power-Ups Used */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Power-Ups Used</h3>
              <ul className="list-none pl-0 mt-2 space-y-4">
                {gameState.power_ups.map((powerUp, index) => (
                  <li key={index} className="flex items-center space-x-4">
                    <div className={`w-6 h-6 bg-${powerUp === 'shuffle'? 'blue' : 'indigo'}-500 rounded-full`}></div>
                    <span className="text-gray-700 text-lg font-medium">{powerUp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Progress Updates */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Progress</h3>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-green-800">🎉 New Personal Best: {gameState.score} points!</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-blue-800">🔥 You've completed 5 games this session!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8">
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              Retry
            </button>
          </div>

          {/* Social Sharing */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Share Your Achievement</h3>
            <div className="space-x-6 flex justify-center">
              <button
                onClick={() => handleShare('twitter')}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 group relative"
                data-platform="twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-6 w-6" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 0-3.06 1.71 4.48 4.48 0 0 1-8.3 2.48 4.48 4.48 0 0 1 1.1-4.14 10.9 10.9 0 0 1 3.06-1.71c6.31 0 11.46 4.48 11.46 10.22 0.61 0 1.25-.15 1.85a4.48 4.48 0 0 0 3.13 2.32 8.47 8.47 0 0 1-12.25 3.15 4.48 4.48 0 0 1 1.1-4.14 4.48 4.48 0 0 1 8.3 2.48A10.9 10.9 0 0 0 23 3z"/>
                </svg>
                <div className="absolute inset-x-0 bottom-0 bg-blue-500 text-white p-1 text-sm rounded-md transition-all duration-300 opacity-0 group-hover:opacity-100">
                  {shareStatus === 'success'? 'Shared!' : 'Share'}
                </div>
                {shareStatus === 'error' && (
                  <div className="absolute inset-x-0 bottom-0 bg-red-500 text-white p-1 text-sm rounded-md">
                    Error
                  </div>
                )}
              </button>
              
              <button
                onClick={() => handleShare('facebook')}
                className="bg-blue-800 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 group relative"
                data-platform="facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-6 w-6" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M23.53 4.47c-.46-.34-1.03-.27-1.43.14l-2.11 1.04a.55.55 0 0 0.27.55l1.48 2.19c.18.33.59.5.95.5h2.13c.36 0.66-.12.91-.31l2.3-1.62c.63-.36 1.02-1.01 1.01-1.84v-6.49c0-.93-.69-1.66-1.48-1.66a1.54 1.54 0 0 0-1.48 1.66v5.99z"/>
                </svg>
                <div className="absolute inset-x-0 bottom-0 bg-blue-800 text-white p-1 text-sm rounded-md transition-all duration-300 opacity-0 group-hover:opacity-100">
                  {shareStatus === 'success'? 'Shared!' : 'Share'}
                </div>
                {shareStatus === 'error' && (
                  <div className="absolute inset-x-0 bottom-0 bg-red-500 text-white p-1 text-sm rounded-md">
                    Error
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UV_Results;