import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../../src/app.js';
import { env } from '../../src/config/env.js';
import { firestore } from '../../src/config/firebase.js';
import admin from 'firebase-admin';
import { signInWithPassword, ensureAdminDoc, deleteDocById } from '../utils/firebaseHelpers.js';

const app = createApp();

const FIREBASE_KEY = env.FIREBASE_WEB_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD;
const shouldRun = Boolean(FIREBASE_KEY && ADMIN_EMAIL && ADMIN_PASSWORD);

(shouldRun ? describe : describe.skip)('Registrations integration (real Firestore)', ()=>{
  it('admin creates tour -> public registers -> admin sees registration', async ()=>{
    // sign in admin
    const body = await signInWithPassword(FIREBASE_KEY!, ADMIN_EMAIL!, ADMIN_PASSWORD!);
    const idToken = body.idToken as string;
    const localId = body.localId as string;

    await ensureAdminDoc(firestore, localId, ADMIN_EMAIL!);

    // create tour via admin API
    const createBody = { title: 'IT Reg Tour', description: 'd', itinerary: 'it', startDate: '2025-12-20', endDate: '2025-12-22', status: 'open', price: 1000, images: ['img.jpg'] };
    const createRes = await request(app).post('/api/v1/admin/tours').set('Authorization', `Bearer ${idToken}`).send(createBody);
    expect(createRes.status).toBe(200);
    const tourId = createRes.body.data.tourId as string;

    // public registers
    const regRes = await request(app).post('/api/v1/registrations').send({ tourId, fullName: 'IT Tester', phone: '+84901234567', email: 'it@example.com' });
    expect(regRes.status).toBe(200);

    // admin lists registrations
    const listRes = await request(app).get(`/api/v1/admin/registrations?tourId=${tourId}`).set('Authorization', `Bearer ${idToken}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    const found = listRes.body.data.find((r:any)=> r.fullName === 'IT Tester');
    expect(found).toBeTruthy();

    // cleanup: delete tour and any registrations for this tour
    await deleteDocById(firestore, 'tours', tourId);
    // registrations cleanup via query
    const snap = await firestore.collection('registrations').where('tourId','==',tourId).get();
    const batch = firestore.batch();
    snap.docs.forEach((d:any)=> batch.delete(d.ref));
    await batch.commit();
  }, 20000);
});
