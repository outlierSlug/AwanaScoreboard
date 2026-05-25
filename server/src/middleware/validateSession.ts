import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";
import { ZodObject } from "zod";
import { AppError } from "./errorHandler";

/**
 * validateRequest(schema)
 * - Generic middleware to validate { body, query, params } shape via a Zod object.
 * - Attaches the parsed/validated result to `req.validated` so handlers use safe data.
 *
 * Example usage:
 *   router.post('/', validateRequest(mySchema), (req, res) => {
 *     const { body } = req.validated as { body: MyType }
 *     ...
 *   })
 */
export function validateRequest(schema: ZodObject<any>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // parseAsync returns an object shaped like { body, query, params }
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Attach validated data to the request in a namespaced field to avoid TS conflicts.
      req.validated = validatedData;

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * Helper to extract sessionId from validated data / params / body in a stable way.
 * Returns string | undefined.
 */
const resolveSessionId = (req: Request): string | undefined => {
  // Prefer validated.body.sessionId if present (from validateRequest)
  const validatedBody = (req as any).validated?.body;
  if (validatedBody && typeof validatedBody.sessionId === "string") {
    return validatedBody.sessionId;
  }

  // Fall back to params or body
  if (req.params && typeof req.params.sessionId === "string") {
    return req.params.sessionId;
  }
  if (req.body && typeof req.body.sessionId === "string") {
    return req.body.sessionId;
  }

  return undefined;
};

/**
 * validateSession middleware:
 * - Ensures sessionId is present and corresponds to an existing session row.
 * - Attaches the found session object to req.session for downstream handlers.
 */
export async function validateSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const sessionId = resolveSessionId(req);

    if (!sessionId) {
      throw new AppError(400, "Session ID is required");
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError(404, "Session not found");
    }

    // attach to request for downstream usage
    req.session = session;

    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * validateSessionState(allowedStates)
 * - Ensures the session exists and its `status` is one of allowedStates.
 * - Attaches session to req.session.
 *
 * Example:
 *   router.post('/', validateSessionState(['setup','running']), handler)
 */
export function validateSessionState(allowedStates: Array<"setup" | "running" | "finished">) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const sessionId = resolveSessionId(req);

      if (!sessionId) {
        throw new AppError(400, "Session ID is required");
      }

      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        throw new AppError(404, "Session not found");
      }

      if (!allowedStates.includes(session.status as "setup" | "running" | "finished")) {
        throw new AppError(
          400,
          `Operation not allowed in ${session.status} state. Must be in ${allowedStates.join(" or ")} state.`
        );
      }

      req.session = session;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}