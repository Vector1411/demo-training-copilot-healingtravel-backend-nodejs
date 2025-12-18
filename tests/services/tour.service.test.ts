import { describe, it, expect, vi, beforeEach } from 'vitest';
import admin from 'firebase-admin';

import { TourService } from '../../src/services/TourService.js';
import { TourRepository } from '../../src/repositories/TourRepository.js';
import { AppError } from '../../src/shared/AppError.js';

function fakeTimestamp(dateStr: string){ return { toDate: () => new Date(dateStr) }; }

describe('TourService (unit)', ()=>{
  beforeEach(()=>{ vi.restoreAllMocks(); });

  it('listPublicTours - maps dates and thumbnail', async ()=>{
    vi.spyOn(TourRepository.prototype, 'listByStatus').mockResolvedValue([
      { id:'t1', title:'T1', startDate: fakeTimestamp('2025-01-01'), endDate: '2025-01-05', price:100, status:'open', images:['a.jpg'] } as any,
      { id:'t2', title:'T2', startDate: { _seconds: 1760000000 }, endDate: null, price:200, status:'open', images:[] } as any
    ]);
    const svc = new TourService();
    const rows = await svc.listPublicTours();
    expect(rows.length).toBe(2);
    expect(rows[0].startDate).toBe('2025-01-01');
    expect(rows[0].thumbnail).toBe('a.jpg');
    expect(rows[1].startDate).toBe(new Date(1760000000*1000).toISOString().slice(0,10));
  });

  it('listPublicTours - repo failure -> TOUR_FETCH_FAILED', async ()=>{
    vi.spyOn(TourRepository.prototype, 'listByStatus').mockRejectedValue(new Error('boom'));
    const svc = new TourService();
    await expect(svc.listPublicTours()).rejects.toMatchObject({ errorCode: 'TOUR_FETCH_FAILED' });
  });

  it('getTourDetail - not found -> TOUR_NOT_FOUND', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue(null as any);
    const svc = new TourService();
    await expect(svc.getTourDetail('x')).rejects.toMatchObject({ errorCode: 'TOUR_NOT_FOUND' });
  });

  it('getTourDetail - success mapping', async ()=>{
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
      startDate: fakeTimestamp('2025-02-02'),
      endDate: fakeTimestamp('2025-02-03'),
      price: 500,
      status: 'open',
      images: ['i1','i2']
    } as any);
    const svc = new TourService();
    const r = await svc.getTourDetail('t1');
    expect(r.tourId).toBe('t1');
    expect(r.location).toBe('Sapa, Lào Cai');
    expect(r.duration).toBe('5 ngày 4 đêm');
    expect(r.content).toEqual({
      introduction: 'intro',
      schedule: 'sched',
      activities: 'acts',
      suitableFor: 'people',
      notes: 'notes'
    });
    expect(Array.isArray(r.images)).toBe(true);
  });

  it('adminListTours - reads from firestore snapshot', async ()=>{
    // mock admin.firestore().collection(...).get() chain
    const fakeSnap = { docs: [ { id:'t1', data: ()=>({ title:'T1', startDate: fakeTimestamp('2025-03-01'), endDate: fakeTimestamp('2025-03-02'), price:10, status:'open', images:['x'] }) } ] } as any;
    vi.spyOn(admin, 'firestore').mockReturnValue({ collection: ()=>({ get: async ()=> fakeSnap }) } as any);
    const svc = new TourService();
    const rows = await svc.adminListTours();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows[0].tourId).toBe('t1');
  });

  it('listPublicTours - applies text/location/price filters', async ()=>{
    vi.spyOn(TourRepository.prototype, 'listByStatus').mockResolvedValue([
      { id:'t1', title:'Thiền núi rừng', description:'Sapa retreat', itinerary:'...', location:'Sapa, Lào Cai', price:8000000, status:'open' } as any,
      { id:'t2', title:'Yoga biển', description:'Nha Trang', itinerary:'...', location:'Nha Trang, Khánh Hòa', price:5000000, status:'open' } as any
    ]);
    const svc = new TourService();
    const rows = await svc.listPublicTours({ q:'sapa', location:'Sapa', minPrice:7000000, maxPrice:9000000 });
    expect(rows.length).toBe(1);
    expect(rows[0].tourId).toBe('t1');
  });
});
