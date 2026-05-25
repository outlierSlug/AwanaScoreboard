import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { calculatePoints } from "../services/roundService";
import { IdGenerator } from "../services/idGenerator";


export function createRoundRouter(prisma: PrismaClient): Router {
    const router = Router();

    router.post("/", async (req, res, next) => {
        try {
            const { sessionId, gameId, roundNumber, placements } = req.body;

            // Log incoming data to debug
            console.log('Creating round with:', { sessionId, gameId, roundNumber, placements });

            // Validate input
            if (!sessionId || !gameId || !roundNumber || !placements?.length) {
                return res.status(400).json({ 
                    error: 'Missing required fields' 
                });
            }

            // Start a transaction to handle round creation and score updates
            const result = await prisma.$transaction(async (tx) => {
                // 1. Calculate points for placements
                const scoredPlacements = calculatePoints(placements);

                // Generate round ID using the new format
                const roundId = `${sessionId}-${roundNumber}`;

                // 2. Create the round and its results
                const round = await tx.round.create({
                    data: {
                        id: roundId,
                        sessionId,
                        gameId,
                        roundNumber,
                        results: {
                            create: scoredPlacements.map((p) => ({
                                id: `${roundId}-${p.teamId}`,
                                teamId: p.teamId,
                                place: p.place,
                                pointsAwarded: p.pointsAwarded,
                                note: p.dq ? "DQ" : null,
                            })),
                        },
                    },
                    include: {
                        results: true,
                    },
                });

                // 3. Update session scores for each team
                for (const result of round.results) {
                    await tx.sessionScore.update({
                        where: {
                            sessionId_teamId: {
                                sessionId,
                                teamId: result.teamId,
                            },
                        },
                        data: {
                            totalPoints: { increment: result.pointsAwarded },
                            roundsPlayed: { increment: 1 },
                        },
                    });
                }

                // 4. Get updated session scores
                const updatedScores = await tx.sessionScore.findMany({
                    where: { sessionId },
                    include: { team: true },
                });

                return { round, scores: updatedScores };
            });

            res.status(201).json(result);
        } catch (err) {
            console.error('Round creation error:', err);
            next(err);
        }
    });

    router.delete("/:roundId", async (req, res, next) => {
        try {
            const { roundId } = req.params;

            // Start a transaction
            const result = await prisma.$transaction(async (tx) => {
                // 1. Get the round to find its session
                const round = await tx.round.findUnique({
                    where: { id: roundId },
                    include: { 
                        session: true,
                        results: true
                    }
                });

                if (!round) {
                    throw new Error("Round not found");
                }

                // 2. Delete the round (cascade will handle results)
                await tx.round.delete({
                    where: { id: roundId }
                });

                // 3. Get all remaining rounds and their results
                const remainingRounds = await tx.round.findMany({
                    where: { sessionId: round.sessionId },
                    include: { results: true },
                    orderBy: { roundNumber: 'asc' }
                });

                // 4. Calculate new scores for each team
                const teamScores = new Map<string, { points: number, rounds: number }>();
                
                // Initialize scores for all teams
                round.results.forEach(result => {
                    teamScores.set(result.teamId, { points: 0, rounds: 0 });
                });

                // Add up points from remaining rounds
                remainingRounds.forEach(r => {
                    r.results.forEach(result => {
                        const current = teamScores.get(result.teamId) || { points: 0, rounds: 0 };
                        teamScores.set(result.teamId, {
                            points: current.points + result.pointsAwarded,
                            rounds: current.rounds + 1
                        });
                    });
                });

                // 5. Update session scores with new totals
                for (const [teamId, scores] of teamScores) {
                    await tx.sessionScore.update({
                        where: {
                            sessionId_teamId: {
                                sessionId: round.sessionId,
                                teamId: teamId
                            }
                        },
                        data: {
                            totalPoints: scores.points,
                            roundsPlayed: scores.rounds
                        }
                    });
                }

                // 6. Get updated scores to return
                const updatedScores = await tx.sessionScore.findMany({
                    where: { sessionId: round.sessionId },
                    include: { team: true }
                });

                return { scores: updatedScores, rounds: remainingRounds };
            });

            res.json(result);
        } catch (err) {
            next(err);
        }
    });

    return router;
}