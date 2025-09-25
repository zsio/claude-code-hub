export type SuccessResult<T = undefined> = T extends undefined
  ? { ok: true; data?: undefined }
  : { ok: true; data: T };

export type ActionResult<T = undefined> = SuccessResult<T> | { ok: false; error: string };
