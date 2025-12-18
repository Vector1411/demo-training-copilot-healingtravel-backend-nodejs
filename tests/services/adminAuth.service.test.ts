import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AdminAuthService } from '../../src/services/AdminAuthService.js';
import { AdminRepository } from '../../src/repositories/AdminRepository.js';
import { env } from '../../src/config/env.js';

describe('AdminAuthService (unit)', ()=>{
  beforeEach(()=>{ vi.restoreAllMocks(); env.FIREBASE_WEB_API_KEY = undefined as any; delete (globalThis as any).fetch; });

  it('login - missing API key -> AUTH_NOT_CONFIGURED', async ()=>{
    const svc = new AdminAuthService();
    await expect(svc.login('a','b')).rejects.toMatchObject({ errorCode: 'AUTH_NOT_CONFIGURED' });
  });

  it('login - fetch not ok -> AUTH_FAILED', async ()=>{
    env.FIREBASE_WEB_API_KEY = 'key';
    (globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: false, json: async ()=>({ error: 'bad' }) });
    const svc = new AdminAuthService();
    await expect(svc.login('a','b')).rejects.toMatchObject({ errorCode: 'AUTH_FAILED' });
  });

  it('login - success but not in admins -> AUTH_FAILED', async ()=>{
    env.FIREBASE_WEB_API_KEY = 'key';
    (globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true, json: async ()=>({ idToken: 'id', expiresIn: '3600', localId: 'uid' }) });
    vi.spyOn(AdminRepository.prototype, 'findById').mockResolvedValue(null as any);
    vi.spyOn(AdminRepository.prototype, 'findByEmail').mockResolvedValue(null as any);
    const svc = new AdminAuthService();
    await expect(svc.login('a@b','pwd')).rejects.toMatchObject({ errorCode: 'AUTH_FAILED' });
  });

  it('login - success returns token and expiredAt', async ()=>{
    env.FIREBASE_WEB_API_KEY = 'key';
    (globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true, json: async ()=>({ idToken: 'id', expiresIn: '3600', localId: 'uid' }) });
    vi.spyOn(AdminRepository.prototype, 'findById').mockResolvedValue({ id:'uid', email:'a@b', role:'admin' } as any);
    vi.spyOn(AdminRepository.prototype, 'touchLastLogin').mockResolvedValue(undefined as any);
    const svc = new AdminAuthService();
    const r = await svc.login('a@b','pwd');
    expect(r.token).toBe('id');
    expect(typeof r.expiredAt).toBe('string');
  });
});
