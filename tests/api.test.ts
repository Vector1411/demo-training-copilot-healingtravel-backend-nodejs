import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { AppError } from '../src/shared/AppError.js';

import { TourRepository } from '../src/repositories/TourRepository.js';
import { TourService } from '../src/services/TourService.js';
import { RegistrationRepository } from '../src/repositories/RegistrationRepository.js';
import { AdminRepository } from '../src/repositories/AdminRepository.js';
import { firebaseAuth } from '../src/config/firebase.js';
import { env } from '../src/config/env.js';

const app = createApp();

function fakeTimestamp(dateStr: string){
  return { toDate: () => new Date(dateStr) };
}

describe('Public Tours API', ()=>{
  beforeEach(()=>{
    vi.restoreAllMocks();
  });

  it('GET /api/v1/tours - success', async ()=>{
    vi.spyOn(TourRepository.prototype, 'listByStatus').mockResolvedValue([{ id:'t1', title:'T1', startDate:fakeTimestamp('2025-03-01'), endDate:fakeTimestamp('2025-03-03'), price:3500000, status:'open', images:['thumb.jpg'] } as any]);
    const res = await request(app).get('/api/v1/tours');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].tourId).toBe('t1');
    expect(res.body.data[0].thumbnail).toBe('thumb.jpg');
  });

  it('GET /api/v1/tours - repo failure maps to TOUR_FETCH_FAILED', async ()=>{
    vi.spyOn(TourRepository.prototype, 'listByStatus').mockRejectedValue(new Error('boom'));
    const res = await request(app).get('/api/v1/tours');
    expect(res.status).toBe(500);
    expect(res.body.errorCode).toBe('TOUR_FETCH_FAILED');
  });

  it('GET /api/v1/tours/:tourId - success', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue({
      id: 't1',
      title: 'T1',
      description: 'd',
      itinerary: 'it',
      location: 'Sapa, Lào Cai',
      duration: '5 ngày 4 đêm',
      content: {
        introduction: 'intro',
        schedule: 'sched',
        activities: 'acts',
        suitableFor: 'people',
        notes: 'notes'
      },
      startDate: fakeTimestamp('2025-03-01'),
      endDate: fakeTimestamp('2025-03-03'),
      price: 1000,
      status: 'open',
      images: ['a','b']
    } as any);
    const res = await request(app).get('/api/v1/tours/t1');
    expect(res.status).toBe(200);
    expect(res.body.data.tourId).toBe('t1');
    expect(res.body.data.location).toBe('Sapa, Lào Cai');
    expect(res.body.data.duration).toBe('5 ngày 4 đêm');
    expect(res.body.data.content).toEqual({
      introduction: 'intro',
      schedule: 'sched',
      activities: 'acts',
      suitableFor: 'people',
      notes: 'notes'
    });
    expect(Array.isArray(res.body.data.images)).toBe(true);
  });

  it('GET /api/v1/tours/:tourId - not found', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue(null);
    const res = await request(app).get('/api/v1/tours/unknown');
    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('TOUR_NOT_FOUND');
  });
});

describe('Registrations API', ()=>{
  beforeEach(()=>{ vi.restoreAllMocks(); });

  it('POST /api/v1/registrations - success', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue({ id:'t1', status:'open' } as any);
    vi.spyOn(RegistrationRepository.prototype, 'create').mockResolvedValue('r1');
    const res = await request(app).post('/api/v1/registrations').send({ tourId:'t1', fullName:'Nguyen A', phone:'0909123456' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Đăng ký thành công');
  });

  it('POST /api/v1/registrations - invalid input', async ()=>{
    const res = await request(app).post('/api/v1/registrations').send({ tourId:'', fullName:'', phone:'bad' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('INVALID_INPUT');
  });

  it('POST /api/v1/registrations - tour closed', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue({ id:'t1', status:'closed' } as any);
    const res = await request(app).post('/api/v1/registrations').send({ tourId:'t1', fullName:'Name', phone:'0909123456' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('TOUR_CLOSED');
  });

  it('POST /api/v1/registrations - registration failure', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue({ id:'t1', status:'open' } as any);
    vi.spyOn(RegistrationRepository.prototype, 'create').mockRejectedValue(new Error('db fail'));
    const res = await request(app).post('/api/v1/registrations').send({ tourId:'t1', fullName:'Name', phone:'0909123456' });
    expect(res.status).toBe(500);
    expect(res.body.errorCode).toBe('REGISTRATION_FAILED');
  });
});

describe('Admin Auth and Admin APIs', ()=>{
  beforeEach(()=>{ vi.restoreAllMocks(); });

  it('POST /api/v1/admin/login - success', async ()=>{
    // ensure env key present
    env.FIREBASE_WEB_API_KEY = 'testkey';
  const fetchMock = vi.fn().mockResolvedValue({ ok:true, json: async ()=>({ idToken:'id', expiresIn:'3600', localId:'uid' }) });
    (globalThis as any).fetch = fetchMock;
  vi.spyOn(AdminRepository.prototype, 'findById').mockResolvedValue({ id:'uid', email:'admin@example.com', role:'admin' } as any);
    vi.spyOn(AdminRepository.prototype, 'touchLastLogin').mockResolvedValue(undefined as any);
  const res = await request(app).post('/api/v1/admin/login').send({ email:'admin@example.com', password:'pwd' });
  if(res.status!==200) console.log('ADMIN LOGIN SUCCESS TEST RESP', res.body);
  expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('id');
    expect(typeof res.body.data.expiredAt).toBe('string');
  });

  it('POST /api/v1/admin/login - bad creds', async ()=>{
    env.FIREBASE_WEB_API_KEY = 'key';
  const fetchMock = vi.fn().mockResolvedValue({ ok:false, json: async ()=>({ error: 'bad' }) });
    (globalThis as any).fetch = fetchMock;
  const res = await request(app).post('/api/v1/admin/login').send({ email:'admin@example.com', password:'bad' });
  if(res.status!==401) console.log('ADMIN LOGIN BAD CREDS RESP', res.body);
  expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('AUTH_FAILED');
  });

  it('Protected admin endpoints require token and admin role', async ()=>{
    // verify missing header
    let res = await request(app).get('/api/v1/admin/tours');
    expect(res.status).toBe(401);

    // invalid token
    vi.spyOn(firebaseAuth, 'verifyIdToken' as any).mockRejectedValue(new Error('invalid'));
    res = await request(app).get('/api/v1/admin/tours').set('Authorization','Bearer bad');
    expect(res.status).toBe(401);

    // valid token but not admin
    vi.spyOn(firebaseAuth, 'verifyIdToken' as any).mockResolvedValue({ uid:'u' } as any);
    vi.spyOn(AdminRepository.prototype, 'findById').mockResolvedValue(null as any);
    res = await request(app).get('/api/v1/admin/tours').set('Authorization','Bearer good');
    expect(res.status).toBe(403);
  });

  it('GET /api/v1/admin/tours - success when authorized', async ()=>{
  vi.spyOn(firebaseAuth, 'verifyIdToken' as any).mockResolvedValue({ uid:'u', email:'admin@example.com' } as any);
  vi.spyOn(AdminRepository.prototype, 'findById').mockResolvedValue({ id:'u', email:'admin@example.com', role:'admin' } as any);
  // adminListTours uses TourService.adminListTours which queries Firestore directly; stub the service method
  vi.spyOn(TourService.prototype, 'adminListTours').mockResolvedValue([] as any);
    const res = await request(app).get('/api/v1/admin/tours').set('Authorization','Bearer good');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/admin/tours - validate input', async ()=>{
    vi.spyOn(firebaseAuth, 'verifyIdToken' as any).mockResolvedValue({ uid:'u' } as any);
    vi.spyOn(AdminRepository.prototype, 'findById').mockResolvedValue({ id:'u', email:'a', role:'admin' } as any);
    const res = await request(app).post('/api/v1/admin/tours').set('Authorization','Bearer good').send({ title:'', description:'' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('INVALID_INPUT');
  });
});
