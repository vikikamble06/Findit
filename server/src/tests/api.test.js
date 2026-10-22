import { describe, it, expect, vi, beforeAll } from 'vitest';
const request = require('supertest');
const mongoose = require('mongoose');

// Prevent Mongoose from buffering queries if disconnected
mongoose.set('bufferCommands', false);

const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const app = require('../app');

const mockUser = {
  _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
  name: 'Test Student',
  email: 'test.student@campus.edu',
  role: 'user',
  status: 'active',
  studentId: 'CS-2024-042',
  department: 'Computer Science',
  createdAt: new Date(),
  comparePassword: vi.fn().mockImplementation((pwd) => Promise.resolve(pwd === 'CorrectPass123!')),
  save: vi.fn().mockResolvedValue(true)
};

const mockItem = {
  _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439022'),
  title: 'Lost BoAt Earbuds',
  type: 'lost',
  category: 'Electronics',
  color: 'Black',
  campusZone: 'Central Library',
  approximateLocation: '2nd Floor Table 14',
  date: new Date(),
  status: 'open',
  images: [],
  reporter: { name: 'Test Student', department: 'CS' }
};

function createMongooseQueryMock(result) {
  const p = Promise.resolve(result);
  p.populate = vi.fn().mockReturnValue(p);
  p.sort = vi.fn().mockReturnValue(p);
  p.skip = vi.fn().mockReturnValue(p);
  p.limit = vi.fn().mockReturnValue(p);
  p.select = vi.fn().mockReturnValue(p);
  p.lean = vi.fn().mockReturnValue(p);
  return p;
}

beforeAll(() => {
  // Spy on User methods
  vi.spyOn(User, 'findOne').mockImplementation(({ email }) => {
    if (email === 'existing@campus.edu' || email === 'test.student@campus.edu') {
      return createMongooseQueryMock(mockUser);
    }
    return createMongooseQueryMock(null);
  });

  vi.spyOn(User, 'findById').mockImplementation(() => Promise.resolve(mockUser));
  vi.spyOn(User, 'create').mockImplementation((data) => Promise.resolve({ ...mockUser, ...data }));
  vi.spyOn(User, 'countDocuments').mockResolvedValue(4);

  // Spy on Item methods
  vi.spyOn(Item, 'find').mockImplementation(() => createMongooseQueryMock([mockItem]));
  vi.spyOn(Item, 'findById').mockImplementation(() => createMongooseQueryMock(mockItem));
  vi.spyOn(Item, 'countDocuments').mockResolvedValue(1);

  // Spy on Claim methods
  vi.spyOn(Claim, 'find').mockImplementation(() => createMongooseQueryMock([]));
  vi.spyOn(Claim, 'findOne').mockImplementation(() => createMongooseQueryMock(null));
  vi.spyOn(Claim, 'countDocuments').mockResolvedValue(0);

  // Spy on Notification methods
  vi.spyOn(Notification, 'find').mockImplementation(() => createMongooseQueryMock([]));
  vi.spyOn(Notification, 'countDocuments').mockResolvedValue(0);
});

describe('FindIt Backend API Tests', () => {
  describe('Health Endpoint', () => {
    it('GET /api/health returns 200 with operational status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('Route Security & Protection', () => {
    it('POST /api/items rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({
          type: 'lost',
          title: 'Lost Calculator',
          category: 'Electronics',
          description: 'Left in room 201',
          color: 'Black',
          campusZone: 'Engineering Labs',
          approximateLocation: 'Room 201',
          date: '2026-10-22'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/logout clears token cookie and returns 200', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Public Items API', () => {
    it('GET /api/items returns items list and pagination', async () => {
      const res = await request(app).get('/api/items');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('Authentication API', () => {
    it('POST /api/auth/register rejects existing email with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Existing User',
          email: 'existing@campus.edu',
          password: 'Password123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/auth/login succeeds with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.student@campus.edu',
          password: 'CorrectPass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test.student@campus.edu');
    });

    it('POST /api/auth/login rejects invalid credentials with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.student@campus.edu',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });
  });
});
