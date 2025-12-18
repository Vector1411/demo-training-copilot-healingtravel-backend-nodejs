import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../../src/app.js';
import { env } from '../../src/config/env.js';
import { firestore } from '../../src/config/firebase.js';
import { signInWithPassword, ensureAdminDoc } from '../utils/firebaseHelpers.js';

const app = createApp();

const FIREBASE_KEY = env.FIREBASE_WEB_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD;
const shouldRun = Boolean(FIREBASE_KEY && ADMIN_EMAIL && ADMIN_PASSWORD);

(shouldRun ? describe : describe.skip)('Tours E2E (real Firestore)', ()=>{
  it('admin create -> public sees -> admin close -> public cannot register', async ()=>{
    const body = await signInWithPassword(FIREBASE_KEY!, ADMIN_EMAIL!, ADMIN_PASSWORD!);
    const idToken = body.idToken as string;
    const localId = body.localId as string;
    await ensureAdminDoc(firestore, localId, ADMIN_EMAIL!);

    // create tour open
    const createRes = await request(app).post('/api/v1/admin/tours').set('Authorization', `Bearer ${idToken}`).send({ title: 'E2E Tour', description:'d', itinerary:'it', startDate:'2025-12-25', endDate:'2025-12-27', status:'open', price:100 });
    expect(createRes.status).toBe(200);
    const tourId = createRes.body.data.tourId as string;

    // public list should contain it
    const pubList = await request(app).get('/api/v1/tours');
    expect(pubList.status).toBe(200);
    expect(pubList.body.data.find((t:any)=> t.tourId === tourId)).toBeTruthy();

    // admin close tour
    const upd = await request(app).put(`/api/v1/admin/tours/${tourId}`).set('Authorization', `Bearer ${idToken}`).send({ status: 'closed' });
    expect(upd.status).toBe(200);

    // public registration should now fail
    const reg = await request(app).post('/api/v1/registrations').send({ tourId, fullName: 'E2E User', phone: '+84901234567' });
    expect(reg.status).toBe(400);
    expect(reg.body.errorCode).toBe('TOUR_CLOSED');

    // cleanup
    await firestore.collection('tours').doc(tourId).delete();
    const snap = await firestore.collection('registrations').where('tourId','==',tourId).get();
    const batch = firestore.batch(); snap.docs.forEach((d:any)=> batch.delete(d.ref)); await batch.commit();
  }, 20000);
});
