import type { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/AppError.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const e = err instanceof AppError ? err : new AppError(500, "INTERNAL_ERROR", "Lỗi hệ thống", err);
  res.status(e.httpStatus).json({ success:false, data:null, message:e.message, errorCode:e.errorCode, details: e.details ?? null });
}
