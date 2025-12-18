import type { Request, Response, NextFunction } from "express";
import { RegistrationService } from "../services/RegistrationService.js";
import { okMessage, ok } from "../shared/http.js";
const svc=new RegistrationService();

export async function createRegistration(req: Request,res: Response,next: NextFunction){
  try{ await svc.createRegistration(req.body); res.status(200).json(okMessage("Đăng ký thành công"));
  }catch(e){ next(e); }
}
export async function adminListRegistrations(req: Request,res: Response,next: NextFunction){
  try{ const { tourId }=req.query as any; const data=await svc.adminListRegistrations(tourId);
    res.status(200).json(ok(data));
  }catch(e){ next(e); }
}
