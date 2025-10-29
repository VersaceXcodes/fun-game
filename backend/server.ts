import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createServer } from 'http';
import morgan from 'morgan';
import { z } from 'zod';

// Import zod schemas
import { 
  userEntitySchema, 
  createUserInputSchema, 
  updateUserInputSchema, 
  searchUsersInputSchema,
  postEntitySchema,
  createPostInputSchema,
  updatePostInputSchema,
  commentEntitySchema,
  createCommentInputSchema
} from './schema.ts';

dotenv.config();

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Error response utility
interface ErrorResponse {
  success: false;
  message: string;
  error_code?: string;
  details?: any;
  timestamp: string;
}

function createErrorResponse(
  message: string,
  error?: any,
  errorCode?: string
): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errorCode) {
    response.error_code = errorCode;
  }

  if (error) {
    response.details = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return response;
}

// Environment variables
const { 
  DATABASE_URL, 
  PGHOST, 
  PGDATABASE, 
  PGUSER, 
  PGPASSWORD, 
  PGPORT = 5432, 
  JWT_SECRET = 'your-secret-key',
  PORT = 3000
} = process.env;

// PostgreSQL connection setup
const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { require: true } 
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { require: true },
      }
);

const app = express();
const server = createServer(app);

// Socket.io setup for real-time leaderboard updates
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }
});

// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: "5mb" }));
app.use(morgan('combined')); // Log all requests for better dev experience

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

/*
  Authentication middleware for protected routes
  Validates JWT token and attaches user data to request
*/
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(createErrorResponse('Access token required', null, 'AUTH_TOKEN_MISSING'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [decoded.user_id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json(createErrorResponse('Invalid token - user not found', null, 'AUTH_USER_NOT_FOUND'));
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json(createErrorResponse('Invalid or expired token', error, 'AUTH_TOKEN_INVALID'));
  }
};

/*
  Socket.io authentication middleware
  Validates JWT token for WebSocket connections
*/
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [decoded.user_id]);
    
    if (result.rows.length === 0) {
      return next(new Error('Invalid token'));
    }

    socket.user = result.rows[0];
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

io.use(authenticateSocket);

/*
  WebSocket connection handler
  Manages real-time leaderboard updates and user connections
*/
io.on('connection', (socket) => {
  console.log(`User ${socket.user.username} connected via WebSocket`);
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.username} disconnected`);
  });
});

/*
  Broadcast leaderboard updates to all connected clients
  Called whenever leaderboard data changes
*/
const broadcastLeaderboardUpdate = async () => {
  try {
    const leaderboardData = await getLeaderboardData('all_time');
    io.emit('leaderboard_update', leaderboardData);
  } catch (error) {
    console.error('Error broadcasting leaderboard update:', error);
  }
};

/*
  Helper function to get leaderboard data from database
  Maps comments table to leaderboard entries using score stored in content
*/
const getLeaderboardData = async (type = 'all_time') => {
  let timeFilter = '';
  
  if (type === 'daily') {
    timeFilter = "AND c.created_at >= CURRENT_DATE";
  } else if (type === 'weekly') {
    timeFilter = "AND c.created_at >= CURRENT_DATE - INTERVAL '7 days'";
  }
  
  const query = `
    SELECT 
      u.id as user_id,
      u.username,
      CAST(c.content AS INTEGER) as score,
      c.created_at as timestamp
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.content ~ '^[0-9]+$'
    ${timeFilter}
    ORDER BY CAST(c.content AS INTEGER) DESC
    LIMIT 100
  `;
  
  const result = await pool.query(query);
  return result.rows;
};

// AUTH ENDPOINTS

/*
  POST /api/auth/register
  Creates new user account and returns JWT token
  Uses plain text password storage for development
*/
app.post('/api/auth/register', async (req, res) => {
  try {
    const validatedInput = createUserInputSchema.parse(req.body);
    const { username, email, password_hash } = validatedInput;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json(createErrorResponse('User with this email or username already exists', null, 'USER_ALREADY_EXISTS'));
    }

    // Create user (no password hashing for development)
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username.trim(), email.toLowerCase().trim(), password_hash]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      auth_token: token,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        password_hash: password_hash,
        created_at: user.created_at.toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Registration error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/auth/login
  Authenticates user and returns JWT token
  Uses direct password comparison for development
*/
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    if (!email || !password_hash) {
      return res.status(400).json(createErrorResponse('Email and password are required', null, 'MISSING_REQUIRED_FIELDS'));
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
    }

    const user = result.rows[0];

    // Direct password comparison for development
    if (password_hash !== user.password_hash) {
      return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      auth_token: token,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        password_hash: user.password_hash,
        created_at: user.created_at.toISOString()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// USER ENDPOINTS

/*
  GET /api/users
  Searches users with optional query parameters
  Supports pagination and sorting
*/
app.get('/api/users', async (req, res) => {
  try {
    const params = searchUsersInputSchema.parse(req.query);
    const { query, limit, offset, sort_by, sort_order } = params;

    let sqlQuery = 'SELECT id, username, email, password_hash, created_at FROM users';
    let queryParams = [];
    let whereClause = '';

    if (query) {
      whereClause = ' WHERE username ILIKE $1 OR email ILIKE $1';
      queryParams.push(`%${query}%`);
    }

    sqlQuery += whereClause;
    sqlQuery += ` ORDER BY ${sort_by} ${sort_order}`;
    sqlQuery += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(sqlQuery, queryParams);
    
    const users = result.rows.map(user => ({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      password_hash: user.password_hash,
      created_at: user.created_at.toISOString()
    }));

    res.json(users);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search users error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/{user_id}
  Retrieves specific user profile by ID
*/
app.get('/api/users/:user_id', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);
    
    const result = await pool.query('SELECT id, username, email, password_hash, created_at FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
    }

    const user = result.rows[0];
    res.json({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      password_hash: user.password_hash,
      created_at: user.created_at.toISOString()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PUT /api/users/{user_id}
  Updates user profile information
  Requires authentication
*/
app.put('/api/users/:user_id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);
    const validatedInput = updateUserInputSchema.parse(req.body);

    // Check if user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(403).json(createErrorResponse('You can only update your own profile', null, 'FORBIDDEN'));
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (validatedInput.username) {
      updateFields.push(`username = $${paramCount}`);
      updateValues.push(validatedInput.username);
      paramCount++;
    }

    if (validatedInput.email) {
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(validatedInput.email);
      paramCount++;
    }

    if (validatedInput.password_hash) {
      updateFields.push(`password_hash = $${paramCount}`);
      updateValues.push(validatedInput.password_hash);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_FIELDS_TO_UPDATE'));
    }

    updateValues.push(userId);
    const sqlQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, password_hash, created_at`;

    const result = await pool.query(sqlQuery, updateValues);
    const user = result.rows[0];

    res.json({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      password_hash: user.password_hash,
      created_at: user.created_at.toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update user error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/{user_id}
  Deletes user account and associated data
  Requires authentication
*/
app.delete('/api/users/:user_id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);

    // Check if user is deleting their own account
    if (req.user.id !== userId) {
      return res.status(403).json(createErrorResponse('You can only delete your own account', null, 'FORBIDDEN'));
    }

    // Delete associated data first (comments, posts)
    await pool.query('DELETE FROM comments WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM posts WHERE user_id = $1', [userId]);
    
    // Delete user
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// GAME SESSION ENDPOINTS (using posts table)

/*
  POST /api/games
  Creates new game session using posts table
  Maps difficulty to title, game state to content
*/
app.post('/api/games', authenticateToken, async (req, res) => {
  try {
    const { difficulty } = req.body;
    
    if (!difficulty || !['easy', 'normal', 'hard'].includes(difficulty)) {
      return res.status(400).json(createErrorResponse('Valid difficulty required (easy, normal, hard)', null, 'INVALID_DIFFICULTY'));
    }

    const gameState = {
      difficulty,
      score: 0,
      time_remaining: 60,
      power_ups: ['shuffle', 'freeze'],
      board: generateGameBoard(),
      status: 'active'
    };

    // Create game session in posts table
    const result = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, user_id, title, content, created_at',
      [req.user.id, difficulty, JSON.stringify(gameState)]
    );

    const gameSession = result.rows[0];
    const parsedContent = JSON.parse(gameSession.content);

    res.status(201).json({
      id: gameSession.id.toString(),
      user_id: gameSession.user_id.toString(),
      difficulty: parsedContent.difficulty,
      score: parsedContent.score,
      time_remaining: parsedContent.time_remaining,
      power_ups: parsedContent.power_ups,
      created_at: gameSession.created_at.toISOString()
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Helper function to generate initial game board
  Creates 8x8 grid with random colored tiles
*/
function generateGameBoard() {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const board = [];
  
  for (let i = 0; i < 8; i++) {
    const row = [];
    for (let j = 0; j < 8; j++) {
      row.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    board.push(row);
  }
  
  return board;
}

/*
  GET /api/games/{game_id}
  Retrieves current game state from posts table
*/
app.get('/api/games/:game_id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.game_id);
    
    const result = await pool.query('SELECT id, user_id, title, content, created_at FROM posts WHERE id = $1', [gameId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Game session not found', null, 'GAME_NOT_FOUND'));
    }

    const gameSession = result.rows[0];
    const parsedContent = JSON.parse(gameSession.content);

    res.json({
      id: gameSession.id.toString(),
      user_id: gameSession.user_id.toString(),
      difficulty: parsedContent.difficulty,
      score: parsedContent.score,
      time_remaining: parsedContent.time_remaining,
      power_ups: parsedContent.power_ups,
      created_at: gameSession.created_at.toISOString()
    });
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PUT /api/games/{game_id}
  Updates game state (moves, power-ups, score)
  Updates leaderboard when game ends
*/
app.put('/api/games/:game_id', authenticateToken, async (req, res) => {
  try {
    const gameId = parseInt(req.params.game_id);
    const { move, power_up } = req.body;

    // Get current game state
    const gameResult = await pool.query('SELECT id, user_id, title, content FROM posts WHERE id = $1', [gameId]);
    
    if (gameResult.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Game session not found', null, 'GAME_NOT_FOUND'));
    }

    const gameSession = gameResult.rows[0];
    
    // Check if user owns this game
    if (gameSession.user_id !== req.user.id) {
      return res.status(403).json(createErrorResponse('You can only update your own games', null, 'FORBIDDEN'));
    }

    const gameState = JSON.parse(gameSession.content);

    // Process move
    if (move) {
      // Simulate score calculation
      const baseScore = 10;
      gameState.score += baseScore;
      gameState.time_remaining = Math.max(0, gameState.time_remaining - 1);
    }

    // Process power-up usage
    if (power_up) {
      if (gameState.power_ups.includes(power_up)) {
        gameState.power_ups = gameState.power_ups.filter(p => p !== power_up);
        
        if (power_up === 'freeze') {
          gameState.time_remaining += 5;
        } else if (power_up === 'shuffle') {
          gameState.board = generateGameBoard();
        }
      }
    }

    // Check if game ended
    if (gameState.time_remaining <= 0) {
      gameState.status = 'completed';
      
      // Add score to leaderboard (using comments table)
      await pool.query(
        'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3)',
        [req.user.id, gameId, gameState.score.toString()]
      );
      
      // Broadcast leaderboard update
      await broadcastLeaderboardUpdate();
    }

    // Update game state
    await pool.query(
      'UPDATE posts SET content = $1 WHERE id = $2',
      [JSON.stringify(gameState), gameId]
    );

    res.json({
      id: gameSession.id.toString(),
      user_id: gameSession.user_id.toString(),
      difficulty: gameState.difficulty,
      score: gameState.score,
      time_remaining: gameState.time_remaining,
      power_ups: gameState.power_ups,
      created_at: gameSession.created_at
    });
  } catch (error) {
    console.error('Update game state error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// LEADERBOARD ENDPOINTS

/*
  GET /api/leaderboard
  Retrieves leaderboard data with filtering by time period
  Uses comments table for score storage
*/
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboardType = req.query.leaderboard_type || 'all_time';
    
    if (!['daily', 'weekly', 'all_time'].includes(leaderboardType)) {
      return res.status(400).json(createErrorResponse('Invalid leaderboard type', null, 'INVALID_LEADERBOARD_TYPE'));
    }

    const leaderboardData = await getLeaderboardData(leaderboardType);
    res.json(leaderboardData);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// SOCIAL SHARING ENDPOINT

/*
  @@need:external-api : Social media API integration for Twitter and Facebook sharing
  This function should integrate with Twitter API v2 and Facebook Graph API to post game results
  Twitter API would use POST /2/tweets endpoint with score and custom message
  Facebook API would use POST /me/feed endpoint to share to user's timeline
*/
async function shareToSocialMedia(platform, score, userInfo) {
  // Mock implementation - returns success response matching expected format
  const shareMessage = `I just scored ${score} points in Fun-Game! Can you beat my score? 🎮`;
  
  const mockResponse = {
    success: true,
    platform: platform,
    message: shareMessage,
    share_url: `https://${platform}.com/mock-share-url`,
    timestamp: new Date().toISOString()
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return mockResponse;
}

/*
  POST /api/shares
  Shares game results to social platforms
  Currently mocked for development
*/
app.post('/api/shares', authenticateToken, async (req, res) => {
  try {
    const { score, platform } = req.body;
    
    if (!score || typeof score !== 'number') {
      return res.status(400).json(createErrorResponse('Valid score required', null, 'INVALID_SCORE'));
    }
    
    if (!platform || !['twitter', 'facebook'].includes(platform)) {
      return res.status(400).json(createErrorResponse('Valid platform required (twitter, facebook)', null, 'INVALID_PLATFORM'));
    }

    // Call mocked social media sharing function
    const shareResult = await shareToSocialMedia(platform, score, req.user);
    
    res.status(202).json({
      message: 'Share request accepted',
      share_result: shareResult
    });
  } catch (error) {
    console.error('Share result error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// WEBSOCKET ENDPOINT

/*
  GET /api/websocket
  WebSocket upgrade endpoint documentation
  Actual WebSocket handling is done through Socket.io above
*/
app.get('/api/websocket', (req, res) => {
  res.json({
    message: 'WebSocket endpoint available via Socket.io',
    endpoint: '/socket.io/',
    authentication: 'Pass JWT token in handshake auth.token',
    events: {
      'leaderboard_update': 'Receives real-time leaderboard data'
    }
  });
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Schedule periodic leaderboard updates (every 5 seconds as per requirements)
setInterval(async () => {
  await broadcastLeaderboardUpdate();
}, 5000);

// SPA catch-all: serve index.html for non-API routes only
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export { app, pool };

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} and listening on 0.0.0.0`);
  console.log(`WebSocket server ready for real-time leaderboard updates`);
});