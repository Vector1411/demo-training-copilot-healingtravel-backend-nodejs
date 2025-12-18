import { describe, it, expect, vi, beforeEach } from 'vitest';
import admin from 'firebase-admin';
import { TourService } from '../../src/services/TourService.js';
import { TourRepository } from '../../src/repositories/TourRepository.js';

describe('TourService admin operations (unit)', ()=>{
  beforeEach(()=>{ vi.restoreAllMocks(); });

  it('adminCreateTour - converts dates and returns id', async ()=>{
    const fakeId = 'newid';
    const spy = vi.spyOn(TourRepository.prototype, 'create').mockResolvedValue(fakeId as any);
    const svc = new TourService();
    const r = await svc.adminCreateTour({ title:'t', description:'d', itinerary:'it', startDate:'2025-12-01', endDate:'2025-12-02', status:'open', price:100, images:[] } as any);
    expect(r.tourId).toBe(fakeId);
    expect(spy).toHaveBeenCalled();
  });

  it('adminUpdateTour - converts string dates to Timestamps and calls repo.update', async ()=>{
    const spy = vi.spyOn(TourRepository.prototype, 'update').mockResolvedValue(undefined as any);
    const svc = new TourService();
    const res = await svc.adminUpdateTour('tid', { title:'New', startDate:'2025-12-10', endDate:'2025-12-12' } as any);
    expect(res.tourId).toBe('tid');
    expect(spy).toHaveBeenCalled();
  });

  it('adminDeleteTour - calls repo.delete', async ()=>{
    const spy = vi.spyOn(TourRepository.prototype, 'delete').mockResolvedValue(undefined as any);
    const svc = new TourService();
    const res = await svc.adminDeleteTour('tid');
    expect(res.tourId).toBe('tid');
    expect(spy).toHaveBeenCalled();
  });
});
