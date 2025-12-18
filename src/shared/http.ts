export const ok = <T>(data: T, message = "") => ({ success: true, data, message, errorCode: null });
export const okMessage = (message: string) => ({ success: true, data: null, message, errorCode: null });
