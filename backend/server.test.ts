import { app, pool } from './server';
import { UserEntity, CreateUserInput, AuthResponse } from './zodSchemas';
import supertest from 'supertest';
import { clearDatabase, createTestUser, createTestGame } from './testUtils';

const request = supertest(app);
const agent = request.agent();

describe('Auth Module', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test('should register new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'password123'
    };

    const res = await request.post('/auth/register').send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('auth_token');
    expect(res.body.user).toMatchObject({
      username: userData.username,
      email: userData.email
    });
  });

  test('should login existing user', async () => {
    await createTestUser('loginuser', 'login@example.com', 'password123');
    
    const res = await request.post('/auth/login').send({
      email: 'login@example.com',
      password_hash: 'password123'
    });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('auth_token');
  });

  test('should reject invalid credentials', async () => {
    await createTestUser('invaliduser', 'invalid@example.com', 'password123');
    
    const res = await request.post('/auth/login').send({
      email: 'invalid@example.com',
      password_hash: 'wrongpassword'
    });
    
    expect(res.statusCode).toBe(401);
  });
});

describe('User Module', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    await clearDatabase();
    testUser = await createTestUser('user1', 'user1@example.com', 'password123');
    const loginRes = await request.post('/auth/login').send({
      email: 'user1@example.com',
      password_hash: 'password123'
    });
    authToken = loginRes.body.auth_token;
  });

  test('should get user profile', async () => {
    const res = await agent.set('Authorization', `Bearer ${authToken}`)
     .get(`/users/${testUser.id}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      username: 'user1',
      email: 'user1@example.com'
    }));
  });

  test('should update user profile', async () => {
    const updateData = {
      username: 'newusername',
      email: 'updated@example.com'
    };
    
    const res = await agent.set('Authorization', `Bearer ${authToken}`)
     .put(`/users/${testUser.id}`)
     .send(updateData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining(updateData));
  });
});

describe('Game Module', () => {
  let authToken;

  beforeEach(async () => {
    await clearDatabase();
    const user = await createTestUser('gamer', 'gamer@example.com', 'password123');
    const loginRes = await request.post('/auth/login').send({
      email: 'gamer@example.com',
      password_hash: 'password123'
    });
    authToken = loginRes.body.auth_token;
  });

  test('should start new game', async () => {
    const res = await agent.set('Authorization', `Bearer ${authToken}`)
     .post('/games')
     .send({ difficulty: 'normal' });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.difficulty).toBe('normal');
  });

  test('should update game state', async () => {
    const game = await createTestGame(authToken, 'normal');
    
    const updateData = {
      move: {
        from: '0,0',
        to: '0,1'
      }
    };
    
    const res = await agent.set('Authorization', `Bearer ${authToken}`)
     .put(`/games/${game.id}`)
     .send(updateData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.score).toBeGreaterThan(0);
  });
});

describe('Leaderboard Module', () => {
  let authToken;

  beforeEach(async () => {
    await clearDatabase();
    const user = await createTestUser('player', 'player@example.com', 'password123');
    const loginRes = await request.post('/auth/login').send({
      email: 'player@example.com',
      password_hash: 'password123'
    });
    authToken = loginRes.body.auth_token;
    
    // Create test games with varying scores
    await createTestGame(authToken, 'easy', 100);
    await createTestGame(authToken, 'normal', 250);
    await createTestGame(authToken, 'hard', 500);
  });

  test('should get all-time leaderboard', async () => {
    const res = await request.get('/leaderboard?leaderboard_type=all_time');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].score).toBe(500);
  });
});

describe('Database Operations', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test('should handle user CRUD operations', async () => {
    // Create
    const userData = {
      username: 'dbuser',
      email: 'dbuser@example.com',
      password_hash: 'password123'
    };
    
    const createRes = await request.post('/auth/register').send(userData);
    expect(createRes.statusCode).toBe(201);
    
    // Read
    const readRes = await request.get(`/users/${createRes.body.user.id}`);
    expect(readRes.statusCode).toBe(200);
    
    // Update
    const updateData = {
      username: 'updateduser'
    };
    const updateRes = await agent.set('Authorization', `Bearer ${createRes.body.auth_token}`)
     .put(`/users/${createRes.body.user.id}`)
     .send(updateData);
    expect(updateRes.statusCode).toBe(200);
    
    // Delete
    const deleteRes = await agent.set('Authorization', `Bearer ${createRes.body.auth_token}`)
     .delete(`/users/${createRes.body.user.id}`);
    expect(deleteRes.statusCode).toBe(204);
  });
});