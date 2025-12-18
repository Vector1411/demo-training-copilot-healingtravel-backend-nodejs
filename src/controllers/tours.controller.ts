import type { Request, Response, NextFunction } from "express";
import { TourService } from "../services/TourService.js";
import { ok } from "../shared/http.js";
const svc=new TourService();

export async function getTours(req: Request,res: Response,next: NextFunction){
  try{ const status=typeof req.query.status==="string"?req.query.status:undefined;
    const data=await svc.listPublicTours(status); res.status(200).json(ok(data));
  }catch(e){ next(e); }
}
export async function getTourDetail(req: Request,res: Response,next: NextFunction){
  try{ const { tourId }=req.params as any; const data=await svc.getTourDetail(tourId);
    res.status(200).json(ok(data));
  }catch(e){ next(e); }
}
