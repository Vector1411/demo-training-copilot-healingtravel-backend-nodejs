import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";
import { AppError } from "../shared/AppError.js";

// Validate request parts (body/query/params) using provided Zod schemas.
// On validation error we convert ZodError into a compact, frontend-friendly
// details array: [{ path, message, code }...]
export const validate = (opts: {body?: ZodSchema; query?: ZodSchema; params?: ZodSchema;}) =>
 (req: Request,_res: Response,next: NextFunction) => {
  try{
    if(opts.body) req.body = opts.body.parse(req.body);
    if(opts.query) req.query = opts.query.parse(req.query);
    if(opts.params) req.params = opts.params.parse(req.params);
    next();
  } catch(e){
    // If this is a ZodError, transform it to a clear array of issues.
    if((e as ZodError).issues) {
      const ze = e as ZodError;
      const details = ze.issues.map(i=>({ path: i.path.join('.'), message: i.message, code: i.code }));
      return next(new AppError(400,"INVALID_INPUT","Dữ liệu không hợp lệ", details));
    }
    return next(new AppError(400,"INVALID_INPUT","Dữ liệu không hợp lệ", e));
  }
 };
