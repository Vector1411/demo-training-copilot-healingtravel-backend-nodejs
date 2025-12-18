import { AppError } from "../shared/AppError.js";
import { AdminRepository } from "../repositories/AdminRepository.js";
import { env } from "../config/env.js";

type IdentityToolkitSuccess = {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string; // seconds as string
  localId: string;
};

async function getFetch(){
  // Use global fetch if available (Node 18+). Otherwise dynamically import node-fetch.
  if(typeof (globalThis as any).fetch === "function") return (globalThis as any).fetch;
  try{
    const mod = await import('node-fetch');
    // node-fetch v3 exports default
    return (mod as any).default ?? mod;
  }catch(e){
    throw new AppError(501,"FETCH_NOT_AVAILABLE","No fetch available. Install node >=18 or add 'node-fetch' dependency.", e);
  }
}

/**
 * API-04: POST /admin/login
 *
 * CONFLICT:
 * - API Spec: Firebase Authentication + Firebase ID Token Bearer.
 * - ERD: admins.passwordHash suggests custom auth.
 *
 * Safe skeleton: fail-closed until auth approach is confirmed.
 */
export class AdminAuthService{
  constructor(private repo=new AdminRepository()){}
  async login(email:string, _password:string){
    // Option A: Use Firebase Identity Toolkit signInWithPassword
    const apiKey = env.FIREBASE_WEB_API_KEY;
    if(!apiKey) throw new AppError(501,"AUTH_NOT_CONFIGURED","FIREBASE_WEB_API_KEY is not set in environment");

    const _fetch = await getFetch();
    const resp = await _fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: _password, returnSecureToken: true }) }
    );

    if(!resp.ok){
      // Keep generic error to avoid leaking account existence
      throw new AppError(401,"AUTH_FAILED","Sai email hoặc password");
    }

    const body = (await resp.json()) as IdentityToolkitSuccess;
    const idToken = body.idToken;
    const expiresIn = Number(body.expiresIn || 0);
    const localId = body.localId;

    // Ensure the user is present in admins allow-list
    const adminById = await this.repo.findById(localId);
    const adminByEmail = !adminById ? await this.repo.findByEmail(email) : adminById;
    if(!adminByEmail) {
      // do not expose reason
      throw new AppError(401,"AUTH_FAILED","Sai email hoặc password");
    }

    // touch lastLoginAt (best-effort)
    try{ await this.repo.touchLastLogin(adminByEmail.id ?? localId); }catch(_){/* ignore */}

    const expiredAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    return { token: idToken, expiredAt };
  }
}
