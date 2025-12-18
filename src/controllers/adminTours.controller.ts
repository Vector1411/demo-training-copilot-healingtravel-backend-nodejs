import type { Request, Response, NextFunction } from "express";
import { TourService } from "../services/TourService.js";
import { ok } from "../shared/http.js";
const svc=new TourService();

export async function adminListTours(_req: Request,res: Response,next: NextFunction){ try{
  res.status(200).json(ok(await svc.adminListTours()));
}catch(e){ next(e);} }

export async function adminCreateTour(req: Request,res: Response,next: NextFunction){ try{
  res.status(200).json(ok(await svc.adminCreateTour(req.body)));
}catch(e){ next(e);} }

export async function adminUpdateTour(req: Request,res: Response,next: NextFunction){ try{
  const { tourId }=req.params as any; res.status(200).json(ok(await svc.adminUpdateTour(tourId, req.body)));
}catch(e){ next(e);} }

export async function adminDeleteTour(req: Request,res: Response,next: NextFunction){ try{
  const { tourId }=req.params as any; res.status(200).json(ok(await svc.adminDeleteTour(tourId)));
}catch(e){ next(e);} }
