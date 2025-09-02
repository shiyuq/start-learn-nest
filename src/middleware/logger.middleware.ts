import { NextFunction, Request, Response } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  const start = Date.now();
  res.on('finish', () =>
    console.log(`Request duration: ${Date.now() - start}ms`),
  );
  next();
}
