import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export function createGameRouter(prisma: PrismaClient): Router {
    const router = Router();

    router.get("/", async (_req, res, next) => {
        try {
            const games = await prisma.game.findMany({
                orderBy: { name: 'asc' }
            });
            res.json({ games });
        } catch (err) {
            next(err);
        }
    });

    return router;
}