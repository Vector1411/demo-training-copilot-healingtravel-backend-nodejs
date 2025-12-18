import type { Request, Response, NextFunction } from "express";
import { AdminAuthService } from "../services/AdminAuthService.js";
import { ok } from "../shared/http.js";
const svc=new AdminAuthService();

export async function adminLogin(req: Request,res: Response,next: NextFunction){
  try{ const data=await svc.login(req.body.email, req.body.password); res.status(200).json(ok(data));
  }catch(e){ next(e); }
}
