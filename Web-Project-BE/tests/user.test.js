const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/User');

let mongoServer;

describe('User Controller', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should signup a new user when POST /api/auth/signup is called with all fields', async () => {
    const newUser = {
      username: `alice_${Date.now()}`,
      email: `alice${Date.now()}@example.com`,
      password: 'Password1'
    };

    const res = await api
      .post('/api/auth/signup')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe(newUser.username);

    const users = await User.find({});
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe(newUser.username);
  });

  it('should return 400 when POST /api/auth/signup missing fields', async () => {
    const badUser = {
      username: 'bob'
      // missing email and password
    };

    await api.post('/api/auth/signup').send(badUser).expect(400);
  });

  it('should login an existing user with correct credentials', async () => {
    const user = {
      username: `carol_${Date.now()}`,
      email: `carol${Date.now()}@example.com`,
      password: 'Secret1A'
    };

    // signup first
    await api.post('/api/auth/signup').send(user).expect(201);

    const loginRes = await api
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(loginRes.body.user).toBeDefined();
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.user.email).toBe(user.email.toLowerCase());
  });

  it('should return 401 for login with wrong credentials', async () => {
    await api.post('/api/auth/login').send({ email: 'noone@example.com', password: 'bad' }).expect(401);
  });

  it('should return user info for GET /api/auth/user when authorized', async () => {
    const user = {
      username: `dave_${Date.now()}`,
      email: `dave${Date.now()}@example.com`,
      password: 'MyPass1'
    };

    // signup and login
    await api.post('/api/auth/signup').send(user).expect(201);
    const loginRes = await api.post('/api/auth/login').send({ email: user.email, password: user.password }).expect(200);
    const token = loginRes.body.token;

    const meRes = await api.get('/api/auth/user').set('Authorization', `Bearer ${token}`).expect(200);
    expect(meRes.body).toBeDefined();
    expect(meRes.body.id || meRes.body._id).toBeDefined();
  });

  it('should return 401 for GET /api/auth/user without token', async () => {
    await api.get('/api/auth/user').expect(401);
  });

  it('should update username and password with PUT /api/auth/update-profile and allow login with new password', async () => {
    const user = {
      username: `ed_${Date.now()}`,
      email: `ed${Date.now()}@example.com`,
      password: 'Original1'
    };

    // signup
    await api.post('/api/auth/signup').send(user).expect(201);
    const loginRes = await api.post('/api/auth/login').send({ email: user.email, password: user.password }).expect(200);
    const token = loginRes.body.token;

    // update profile
    const newCreds = { username: `ed_new_${Date.now()}`, password: 'NewPass1' };
    const updateRes = await api.put('/api/auth/update-profile').set('Authorization', `Bearer ${token}`).send(newCreds).expect(200);
    expect(updateRes.body.user).toBeDefined();
    expect(updateRes.body.user.username).toBe(newCreds.username);

    // old password should fail
    await api.post('/api/auth/login').send({ email: user.email, password: user.password }).expect(401);

    // new password should work
    const loginRes2 = await api.post('/api/auth/login').send({ email: user.email, password: newCreds.password }).expect(200);
    expect(loginRes2.body.token).toBeDefined();
  });
});
