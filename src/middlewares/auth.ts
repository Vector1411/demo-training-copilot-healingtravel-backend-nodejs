import type { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase.js";
import { AppError } from "../shared/AppError.js";
import { AdminRepository } from "../repositories/AdminRepository.js";

export async function requireAdmin(req: Request,_res: Response,next: NextFunction){
  const h=req.header("Authorization");
  if(!h?.startsWith("Bearer ")) return next(new AppError(401,"UNAUTHORIZED","Chưa xác thực"));
  try{
    const decoded=await firebaseAuth.verifyIdToken(h.slice(7).trim());
    (req as any).auth={ uid: decoded.uid, email: decoded.email ?? null, claims: decoded };
    const admin=await new AdminRepository().findById(decoded.uid);
    if(!admin || admin.role!=="admin") return next(new AppError(403,"FORBIDDEN","Không có quyền"));
    next();
  } catch(e){ next(new AppError(401,"UNAUTHORIZED","Token không hợp lệ",e)); }
}
