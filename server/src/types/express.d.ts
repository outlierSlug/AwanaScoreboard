import { Session } from "@prisma/client";
declare global {
  namespace Express {
    interface Request {
      session?: Session;
      validated?: { body?: unknown; query?: unknown; params?: unknown };
    }
  }
}
export {};