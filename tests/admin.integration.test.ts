import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import fetch from 'node-fetch';
import { env } from '../src/config/env.js';
import { firestore } from '../src/config/firebase.js';
import admin from 'firebase-admin';

const app = createApp();

const FIREBASE_KEY = env.FIREBASE_WEB_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD;

// This integration test runs only when the required env vars are present.
const shouldRun = Boolean(FIREBASE_KEY && ADMIN_EMAIL && ADMIN_PASSWORD);

(shouldRun ? describe : describe.skip)('Admin integration (requires real Firebase)', ()=>{
  it('POST /api/v1/admin/login - real flow', async ()=>{
    // Sign in via Identity Toolkit to get localId
    const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true })
    });
    expect(resp.ok).toBe(true);
    const body = await resp.json();
    const localId = body.localId as string;
    expect(localId).toBeTruthy();

    // Ensure admin allow-list entry exists in Firestore for localId
    const now = admin.firestore.Timestamp.now();
    await firestore.collection('admins').doc(localId).set({ email: ADMIN_EMAIL, role: 'admin', createdAt: now });

    // Call our API
    const r = await request(app).post('/api/v1/admin/login').send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body.data).toHaveProperty('token');
  }, 20000);

  it('Admin tours lifecycle: create -> update -> delete (real Firestore)', async ()=>{
    // Sign in to get token
    const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true })
    });
    expect(resp.ok).toBe(true);
    const body = await resp.json();
    const idToken = body.idToken as string;
    const localId = body.localId as string;

    // Ensure admin allow-list entry exists
    const now = admin.firestore.Timestamp.now();
    await firestore.collection('admins').doc(localId).set({ email: ADMIN_EMAIL, role: 'admin', createdAt: now });

    // Create tour via API
    const createBody = { title: 'IT Test Tour', description: 'desc', itinerary: 'it', startDate: '2025-12-20', endDate: '2025-12-22', status: 'open', price: 1000, images: ['img.jpg'] };
    const createRes = await request(app).post('/api/v1/admin/tours').set('Authorization', `Bearer ${idToken}`).send(createBody);
    expect(createRes.status).toBe(200);
    const createdId = createRes.body.data.tourId as string;
    expect(createdId).toBeTruthy();

    // Update tour
    const updateRes = await request(app).put(`/api/v1/admin/tours/${createdId}`).set('Authorization', `Bearer ${idToken}`).send({ title: 'IT Test Tour Updated' });
    expect(updateRes.status).toBe(200);

    // Delete tour
    const delRes = await request(app).delete(`/api/v1/admin/tours/${createdId}`).set('Authorization', `Bearer ${idToken}`);
    expect(delRes.status).toBe(200);
  }, 20000);
});
