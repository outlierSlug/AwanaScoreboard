// server/src/routes/sessionRoutes.ts

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { IdGenerator } from '../services/idGenerator';


export function createSessionRouter(prisma: PrismaClient): Router {
  const router = Router();

  // Create a new session
  router.post("/", async (req, res, next) => {
    try {
      const { divisionId, date } = req.body;

      // Generate session ID
     const sessionId = await IdGenerator.generateSessionId(prisma, divisionId, new Date(date));

      // First fetch the division with its teams
      const division = await prisma.division.findUnique({
        where: { id: divisionId },
        include: { teams: true }
      });

      if (!division) {
        return res.status(404).json({ error: "Division not found" });
      }

      // Create session with initial scores
      const session = await prisma.session.create({
        data: {
          id: sessionId,
          divisionId,
          date: new Date(date),
          status: "running",
          teamScores: {
            create: division.teams.map(team => ({
              teamId: team.id,
              totalPoints: 0,
              roundsPlayed: 0
            }))
          }
        },
        include: {
          division: {
            include: {
              teams: true
            }
          },
          teamScores: {
            include: {
              team: true
            }
          }
        }
      });

      res.json({
        id: session.id,
        date: session.date,
        status: session.status,
        division: {
          id: session.division.id,
          name: session.division.name,
          teams: session.division.teams
        }
      });
    } catch (err) {
      next(err);
    }
  });

  //
  router.get("/", async (req, res, next) => {
    try {
      const sessions = await prisma.session.findMany({
        include: {
          division: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      res.json({ sessions });
    } catch (err) {
      next(err);
    }
  });

  // Get all sessions for a division
  router.get("/division/:divisionId", async (req, res, next) => {
    try {
      const { divisionId } = req.params;
      const sessions = await prisma.session.findMany({
        where: { divisionId },
        include: {
          rounds: {
            include: { results: true },
          },
        },
      });
      res.json(sessions);
    } catch (err) {
      next(err);
    }
  });

  // Get session by ID
  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const session = await prisma.session.findUnique({
        where: { id },
        include: {
          division: {
            include: {
              teams: {
                select: {
                  id: true,
                  color: true
                }
              }
            }
          },
          teamScores: true,
          rounds: {
            include: { 
              results: true,
              game: true 
            }
          }
        }
      });

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json({
        id: session.id,
        date: session.date,
        status: session.status,
        division: {
          id: session.division.id,
          name: session.division.name,
          teams: session.division.teams
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // Get session scores
  router.get("/:sessionId/scores", async (req, res, next) => {
    try {
      const { sessionId } = req.params;

      const scores = await prisma.sessionScore.findMany({
        where: { sessionId },
        include: {
          team: {
            select: {
              id: true,
              color: true
            }
          }
        },
        orderBy: {
          totalPoints: 'desc'
        }
      });

      if (!scores.length) {
        return res.status(404).json({ 
          error: "No scores found for this session" 
        });
      }

      res.json({ scores });
    } catch (err) {
      console.error('Error fetching session scores:', err);
      next(err);
    }
  });

  // Get session rounds
  router.get("/:sessionId/rounds", async (req, res, next) => {
    try {
      const { sessionId } = req.params;

      const rounds = await prisma.round.findMany({
        where: { sessionId },
        include: {
          results: {
            include: {
              team: true
            },
            orderBy: { place: 'asc' }
          },
          game: true
        },
        orderBy: {
          roundNumber: 'asc'
        }
      });

      res.json({ rounds });
    } catch (err) {
      console.error('Error fetching session rounds:', err);
      next(err);
    }
  });

  // End session
  router.patch("/:sessionId/end", async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      
      const session = await prisma.session.update({
        where: { id: sessionId },
        data: { 
          status: "finished",
        },
        include: {
          division: true,
          teamScores: {
            include: {
              team: true
            }
          }
        }
      });

      res.json({ session });
    } catch (err) {
      next(err);
    }
  });

  // Delete session
  router.delete("/:sessionId", async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        await prisma.session.delete({
            where: { id: sessionId }
        });

        res.status(204).end();
    } catch (err) {
        next(err);
    }
  });

  return router;
}