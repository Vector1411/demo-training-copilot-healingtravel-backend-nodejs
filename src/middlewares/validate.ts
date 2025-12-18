import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../shared/AppError.js";
export const validate = (opts: {body?: ZodSchema; query?: ZodSchema; params?: ZodSchema;}) =>
 (req: Request,_res: Response,next: NextFunction) => {
  try{
    if(opts.body) req.body = opts.body.parse(req.body);
    if(opts.query) req.query = opts.query.parse(req.query);
    if(opts.params) req.params = opts.params.parse(req.params);
    next();
  } catch(e){ next(new AppError(400,"INVALID_INPUT","Dữ liệu không hợp lệ",e)); }
 };
