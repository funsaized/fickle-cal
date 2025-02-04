// this package has alot of usage..  https://www.npmjs.com/package/cls-hooked
// based on non-recommended API.. why not just use AsyncLocalStorage & middleware?
import type { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";
import { AsyncLocalStorage } from "node:async_hooks";

const asyncLocalStorage = new AsyncLocalStorage<string>();

// Middleware to create & store correlation ID
export const correlator = (req: Request, res: Response, next: NextFunction) => {
  // Generate a correlation ID or use one from the request header
  const correlationId =
    (req.headers["x-correlation-id"] as string) || nanoid(36);

  // Set the correlation ID in response header
  res.setHeader("x-correlation-id", correlationId);
  // Run the rest of the request in the context of this correlation ID
  asyncLocalStorage.run(correlationId, () => {
    next();
  });
};

export const getCorrelationId = (): string => {
  const correlationId = asyncLocalStorage.getStore();
  return correlationId || "NO-CORR-ID-SHOULD-NOT-HAPPEN";
};
