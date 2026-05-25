// server/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/**
 * AppError - an application-specific error that carries an HTTP status code.
 * Throw this from route handlers / middleware for controlled client errors.
 */
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Central Express error handler.
 * - Handles Zod validation errors (err.issues)
 * - Handles Prisma known request errors by shape-checking (code/meta)
 * - Handles AppError (custom)
 * - Falls back to generic 500 for everything else
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log the full error (structured logger recommended for prod)
  console.error("Error:", err);

  // === Zod validation errors ===
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: Array.isArray(issue.path) ? issue.path.join(".") : String(issue.path),
      message: issue.message
    }));

    return res.status(400).json({
      error: "Validation failed",
      details
    });
  }

  // === Prisma-like errors ===
  // Prisma errors arrive as objects with a `code` property (e.g. 'P2002', 'P2003', 'P2025').
  // We can't reliably use instanceof here, so check the shape.
  if (typeof err === "object" && err !== null && "code" in err) {
    const pErr = err as any;
    switch (pErr.code) {
      case "P2002": // Unique constraint failed
        return res.status(409).json({
          error: "Unique constraint failed",
          details: pErr.meta ?? pErr
        });
      case "P2003": // Foreign key constraint failed
        return res.status(400).json({
          error: "Foreign key constraint failed",
          details: pErr.meta ?? pErr
        });
      case "P2025": // Record not found
        return res.status(404).json({
          error: "Record not found",
          details: pErr.meta ?? pErr
        });
      default:
        return res.status(500).json({
          error: "Database error",
          message: pErr.message ?? "An unexpected database error occurred",
          details: pErr.meta ?? undefined
        });
    }
  }

  // === AppError (custom controlled errors) ===
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message
    });
  }

  // === Fallback ===
  const isProduction = process.env.NODE_ENV === "production";

  return res.status(500).json({
    error: "Internal server error",
    message: isProduction ? "Something went wrong" : (err instanceof Error ? err.message : String(err))
  });
}