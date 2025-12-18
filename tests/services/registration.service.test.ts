import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RegistrationService } from '../../src/services/RegistrationService.js';
import { RegistrationRepository } from '../../src/repositories/RegistrationRepository.js';
import { TourRepository } from '../../src/repositories/TourRepository.js';

describe('RegistrationService (unit)', ()=>{
  beforeEach(()=>{ vi.restoreAllMocks(); });

  it('createRegistration - tour not found -> TOUR_NOT_FOUND', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue(null as any);
    const svc = new RegistrationService();
    await expect(svc.createRegistration({ tourId:'x', fullName:'A', phone:'0909' } as any)).rejects.toMatchObject({ errorCode: 'TOUR_NOT_FOUND' });
  });

  it('createRegistration - tour closed -> TOUR_CLOSED', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue({ id:'t1', status:'closed' } as any);
    const svc = new RegistrationService();
    await expect(svc.createRegistration({ tourId:'t1', fullName:'A', phone:'0909' } as any)).rejects.toMatchObject({ errorCode: 'TOUR_CLOSED' });
  });

  it('createRegistration - success calls repo.create', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue({ id:'t1', status:'open' } as any);
    const createSpy = vi.spyOn(RegistrationRepository.prototype, 'create').mockResolvedValue('r1');
    const svc = new RegistrationService();
    await expect(svc.createRegistration({ tourId:'t1', fullName:'A', phone:'0909' } as any)).resolves.toBeUndefined();
    expect(createSpy).toHaveBeenCalled();
  });

  it('createRegistration - repo failure -> REGISTRATION_FAILED', async ()=>{
    vi.spyOn(TourRepository.prototype, 'getById').mockResolvedValue({ id:'t1', status:'open' } as any);
    vi.spyOn(RegistrationRepository.prototype, 'create').mockRejectedValue(new Error('db fail'));
    const svc = new RegistrationService();
    await expect(svc.createRegistration({ tourId:'t1', fullName:'A', phone:'0909' } as any)).rejects.toMatchObject({ errorCode: 'REGISTRATION_FAILED' });
  });
});
