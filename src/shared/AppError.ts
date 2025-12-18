export class AppError extends Error {
  constructor(
    public readonly httpStatus: number,
    public readonly errorCode: string,
    message: string,
    public readonly details?: unknown
  ) { super(message); }
}
