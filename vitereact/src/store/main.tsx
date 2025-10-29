import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { io } from 'socket.io-client'; // Not used in MVP but included per requirements

// Types
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  total_plays?: number;
  highest_score?: number;
  levels_completed?: number;
  badges?: string[];
}

interface AuthState {
  current_user: User | null;
  auth_token: string | null;
  authentication_status: {
    is_authenticated: boolean;
    is_loading: boolean;
  };
  error_message: string | null;
}

interface UserSettings {
  volume_level: number;
  sound_effects_enabled: boolean;
  default_difficulty: 'easy' | 'normal' | 'hard';
  high_contrast_mode: boolean;
}

interface GameState {
  current_game: {
    id: string | null;
    user_id: string | null;
    difficulty: 'easy' | 'normal' | 'hard' | null;
    score: number;
    time_remaining: number;
    power_ups: ('shuffle' | 'freeze')[];
    board: { x: number; y: number; color: string }[] | null;
  };
  timer: number | null;
  available_power_ups: ('shuffle' | 'freeze')[];
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  timestamp: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AppState {
  // Authentication
  authentication_state: AuthState;
  login_user: (email: string, password: string) => Promise<void>;
  register_user: (email: string, password: string, name: string) => Promise<void>;
  logout_user: () => void;
  check_auth: () => Promise<void>;
  update_user_profile: (userData: Partial<User>) => void;
  clear_auth_error: () => void;

  // User Settings
  user_settings: UserSettings;
  update_settings: (settings: Partial<UserSettings>) => void;

  // Game State
  game_state: GameState;
  start_new_game: (difficulty: 'easy' | 'normal' | 'hard') => Promise<void>;
  make_move: (move: { from: { x: number; y: number }; to: { x: number; y: number } }) => Promise<void>;
  use_power_up: (power_up: 'shuffle' | 'freeze') => Promise<void>;
  fetch_game_state: (game_id: string) => Promise<void>;
  reset_game_state: () => void;

  // Leaderboard
  leaderboard_data: LeaderboardEntry[];
  fetch_leaderboard: (leaderboard_type: 'daily' | 'weekly' | 'alltime') => Promise<void>;
  leaderboard_polling_interval: number | null;
  start_leaderboard_polling: () => void;
  stop_leaderboard_polling: () => void;

  // Notifications
  notifications: Notification[];
  add_notification: (notification: Omit<Notification, 'id'>) => void;
  mark_notification_read: (id: string) => void;
}

// CRITICAL: Export as named export
export const useAppStore = create<AppState>(
  persist(
    (set, get) => ({
      // Authentication State
      authentication_state: {
        current_user: null,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: true,
        },
        error_message: null,
      },

      // User Settings
      user_settings: {
        volume_level: 50,
        sound_effects_enabled: true,
        default_difficulty: 'normal',
        high_contrast_mode: false,
      },

      // Game State
      game_state: {
        current_game: {
          id: null,
          user_id: null,
          difficulty: null,
          score: 0,
          time_remaining: 60,
          power_ups: [],
          board: null,
        },
        timer: null,
        available_power_ups: ['shuffle', 'freeze'],
      },

      // Leaderboard
      leaderboard_data: [],
      leaderboard_polling_interval: null,

      // Notifications
      notifications: [],

      // Actions
      login_user: async (email: string, password: string) => {
        set((state) => ({
          authentication_state: {
           ...state.authentication_state,
            authentication_status: {
             ...state.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}api/auth/login`,
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { user, token } = response.data;

          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          
          set((state) => ({
            authentication_state: {
             ...state.authentication_state,
              authentication_status: {
               ...state.authentication_state.authentication_status,
                is_loading: false,
              },
              error_message: errorMessage,
            },
          }));
          throw new Error(errorMessage);
        }
      },

      register_user: async (email: string, password: string, name: string) => {
        set((state) => ({
          authentication_state: {
           ...state.authentication_state,
            authentication_status: {
             ...state.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}api/auth/register`,
            { email, password, name },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { user, token } = response.data;

          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          
          set((state) => ({
            authentication_state: {
             ...state.authentication_state,
              authentication_status: {
               ...state.authentication_state.authentication_status,
                is_loading: false,
              },
              error_message: errorMessage,
            },
          }));
          throw new Error(errorMessage);
        }
      },

      logout_user: () => {
        set((state) => ({
          authentication_state: {
            current_user: null,
            auth_token: null,
            authentication_status: {
              is_authenticated: false,
              is_loading: false,
            },
            error_message: null,
          },
          game_state: {
            current_game: {
              id: null,
              user_id: null,
              difficulty: null,
              score: 0,
              time_remaining: 60,
              power_ups: [],
              board: null,
            },
            timer: null,
            available_power_ups: ['shuffle', 'freeze'],
          },
        }));
      },

      check_auth: async () => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          set((state) => ({
            authentication_state: {
             ...state.authentication_state,
              authentication_status: {
               ...state.authentication_state.authentication_status,
                is_loading: false,
              },
            },
          }));
          return;
        }

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}api/auth/verify`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const { user } = response.data;
          
          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        } catch (error) {
          // Token is invalid, clear auth state
          set((state) => ({
            authentication_state: {
              current_user: null,
              auth_token: null,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        }
      },

      update_user_profile: async (userData: Partial<User>) => {
        const { authentication_state } = get();
        if (!authentication_state.current_user) return;

        try {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}api/users/${authentication_state.current_user.id}`,
            userData,
            { headers: { Authorization: `Bearer ${authentication_state.auth_token}` } }
          );

          const updatedUser = response.data;
          
          set((state) => ({
            authentication_state: {
             ...state.authentication_state,
              current_user: {
               ...state.authentication_state.current_user,
               ...updatedUser,
              },
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
          
          set((state) => ({
            authentication_state: {
             ...state.authentication_state,
              error_message: errorMessage,
            },
          }));
        }
      },

      clear_auth_error: () => {
        set((state) => ({
          authentication_state: {
           ...state.authentication_state,
            error_message: null,
          },
        }));
      },

      // User Settings
      update_settings: (settings: Partial<UserSettings>) => {
        set((state) => ({
          user_settings: {
           ...state.user_settings,
           ...settings,
          },
        }));
      },

      // Game State
      start_new_game: async (difficulty: 'easy' | 'normal' | 'hard') => {
        const { authentication_state } = get();
        if (!authentication_state.current_user) return;

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}api/games`,
            { difficulty },
            { headers: { Authorization: `Bearer ${authentication_state.auth_token}` } }
          );

          const game = response.data;
          
          set((state) => ({
            game_state: {
              current_game: {
                id: game.id,
                user_id: authentication_state.current_user.id,
                difficulty,
                score: 0,
                time_remaining: 60,
                power_ups: ['shuffle', 'freeze'],
                board: null,
              },
              timer: 60,
              available_power_ups: ['shuffle', 'freeze'],
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to start game';
          
          set((state) => ({
            authentication_state: {
             ...state.authentication_state,
              error_message: errorMessage,
            },
          }));
        }
      },

      make_move: async (move: { from: { x: number; y: number }; to: { x: number; y: number } }) => {
        const { game_state } = get();
        if (!game_state.current_game.id) return;

        try {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}api/games/${game_state.current_game.id}`,
            { move },
            { headers: { Authorization: `Bearer ${game_state.current_game.user_id}` } }
          );

          const updatedGame = response.data;
          
          set((state) => ({
            game_state: {
             ...state.game_state,
              current_game: {
               ...state.game_state.current_game,
                score: updatedGame.score,
                // Update board state based on move
              },
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Invalid move';
          
          set((state) => ({
            authentication_state: {
             ...state.authentication_state,
              error_message: errorMessage,
            },
          }));
        }
      },

      use_power_up: async (power_up: 'shuffle' | 'freeze') => {
        const { game_state } = get();
        if (!game_state.current_game.id) return;

        try {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}api/games/${game_state.current_game.id}/powerups`,
            { power_up },
            { headers: { Authorization: `Bearer ${game_state.current_game.user_id}` } }
          );

          const updatedGame = response.data;
          
          set((state) => ({
            game_state: {
             ...state.game_state,
              current_game: {
               ...state.game_state.current_game,
                power_ups: updatedGame.power_ups,
                // Update board state based on power-up
              },
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Power-up failed';
          
          set((state) => ({
            authentication_state: {
             ...state.authentication_state,
              error_message: errorMessage,
            },
          }));
        }
      },

      fetch_game_state: async (game_id: string) => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}api/games/${game_id}`
          );

          const game = response.data;
          
          set((state) => ({
            game_state: {
              current_game: {
                id: game.id,
                user_id: game.user_id,
                difficulty: game.difficulty,
                score: game.score,
                time_remaining: game.time_remaining,
                power_ups: game.power_ups,
                board: game.board,
              },
              timer: game.time_remaining,
              available_power_ups: game.power_ups,
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to load game';
          
          set((state) => ({
            authentication_state: {
              error_message: errorMessage,
            },
          }));
        }
      },

      reset_game_state: () => {
        set((state) => ({
          game_state: {
            current_game: {
              id: null,
              user_id: null,
              difficulty: null,
              score: 0,
              time_remaining: 60,
              power_ups: [],
              board: null,
            },
            timer: null,
            available_power_ups: ['shuffle', 'freeze'],
          },
        }));
      },

      // Leaderboard
      fetch_leaderboard: async (leaderboard_type: 'daily' | 'weekly' | 'alltime') => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}api/leaderboard`,
            { params: { leaderboard_type } }
          );

          const leaderboard = response.data;
          
          set((state) => ({
            leaderboard_data: leaderboard,
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to load leaderboard';
          
          set((state) => ({
            authentication_state: {
              error_message: errorMessage,
            },
          }));
        }
      },

      start_leaderboard_polling: () => {
        const interval = setInterval(async () => {
          await get().fetch_leaderboard('alltime');
        }, 5000);

        set((state) => ({
          leaderboard_polling_interval: interval,
        }));
      },

      stop_leaderboard_polling: () => {
        const interval = get().leaderboard_polling_interval;
        if (interval) clearInterval(interval);
        
        set((state) => ({
          leaderboard_polling_interval: null,
        }));
      },

      // Notifications
      add_notification: (notification: Omit<Notification, 'id'>) => {
        const id = `notif_${Date.now()}`;
        
        set((state) => ({
          notifications: [...state.notifications, {...notification, id }],
        }));
      },

      mark_notification_read: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map(notification => 
            notification.id === id? {...notification, read: true } : notification
          ),
        }));
      },
    }),
    {
      name: 'fun-game-store',
      partialize: (state) => ({
        authentication_state: {
          current_user: state.authentication_state.current_user,
          auth_token: state.authentication_state.auth_token,
          authentication_status: {
            is_authenticated: state.authentication_state.authentication_status.is_authenticated,
            is_loading: false,
          },
          error_message: null,
        },
        user_settings: state.user_settings,
      }),
    }
  )
);

// Export types for component usage
export type { User, AuthState, UserSettings, GameState, LeaderboardEntry, Notification, AppState } from './types';