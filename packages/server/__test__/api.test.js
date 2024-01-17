const request = require('supertest');
const { Database } = require('../src/db.cjs');
const { beforeAll, afterAll } = require('@jest/globals');

// TODO: replace with unit tests
const app = 'http://localhost:3000';

describe('POST /users/signup', () => {
  let db;
  beforeAll(async () => {
    db = new Database();
    await db.connect();
    await db.client.query('DELETE FROM public.users WHERE TRUE;');
  });

  afterAll(async () => {
    // Cleanup that needs to run after all tests, if any
    await db.close();
  });

  it('should create a new user', async () => {
    const response = await request(app).post('/api/users/signup').send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpassword',
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('username', 'testuser');
    expect(response.body).toHaveProperty('email', 'testuser@example.com');
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('created_at');
    expect(response.body).not.toHaveProperty('updated_at');
    expect(response.body).not.toHaveProperty('hashed_password');
  });

  it('should return 400 if validation fails', async () => {
    const response = await request(app).post('/api/users/signup').send({
      username: '',
      email: 'invalidemail',
      password: '',
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  // it('should return 500 if an error occurs', async () => {
  //   const response = await request(app).post('/api/users/signup').send({
  //     username: 'testuser',
  //     email: 'testuser@example.com',
  //     password: 'testpassword',
  //   });

  //   expect(response.statusCode).toBe(500);
  //   expect(response.body).toHaveProperty('error', 'Internal Server Error');
  // });
});

describe('POST /users/signin', () => {
  let db;
  beforeAll(async () => {
    db = new Database();
    await db.connect();
    await db.client.query('DELETE FROM public.users WHERE TRUE;');
    await db.createUser('testuser', 'testuser@example.com', 'testpassword');
  });

  afterAll(async () => {
    // Cleanup that needs to run after all tests, if any
    await db.close();
  });

  it('should return 401 if invalid credentials are provided', async () => {
    const response = await request(app).post('/api/users/signin').send({
      email: 'invaliduser@example.com',
      password: 'password',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should return 401 if password is incorrect', async () => {
    const response = await request(app).post('/api/users/signin').send({
      email: 'testuser@example.com',
      password: 'invalidpassword',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should return 200 if valid credentials are provided', async () => {
    const response = await request(app).post('/api/users/signin').send({
      email: 'testuser@example.com',
      password: 'testpassword',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});

describe('GET /users/me', () => {
  let db;
  let token;

  beforeAll(async () => {
    db = new Database();
    await db.connect();
    await db.client.query('DELETE FROM public.users WHERE TRUE;');
    await db.createUser('testuser', 'testuser@example.com', 'testpassword');

    // Sign in to get the token
    const response = await request(app).post('/api/users/signin').send({
      email: 'testuser@example.com',
      password: 'testpassword',
    });
    token = response.body.token;
  });

  afterAll(async () => {
    // Cleanup that needs to run after all tests, if any
    await db.close();
  });

  it('should return 401 if user is not logged in', async () => {
    const response = await request(app).get('/api/users/me');

    expect(response.statusCode).toBe(401);
    console.log(response.body);
    expect(response.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should return user details if user is logged in', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('email', 'testuser@example.com');
  });
});
