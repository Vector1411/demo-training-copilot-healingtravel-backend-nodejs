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
});
