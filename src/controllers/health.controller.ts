import type { Request, Response, NextFunction } from "express";
export function health(_req: Request, res: Response, _next: NextFunction){
  return res.status(200).json({ success: true, data: { up: true }, message: "", errorCode: null });
}
