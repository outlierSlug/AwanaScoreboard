import { z } from "zod";

// Round schemas
export const placementSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  place: z.union([z.number().int().min(1).max(4), z.literal("DQ")])
});

export const createRoundSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  gameId: z.string().min(1, "Game ID is required"),
  roundNumber: z.number().int().positive(),
  placements: z.array(placementSchema)
    .min(1, "At least one placement is required")
    .refine(
      (placements: { teamId: string; place: number | "DQ" }[]) => 
        new Set(placements.map((p: { teamId: string }) => p.teamId)).size === placements.length,
      "Each team can only appear once in placements"
    ),
  createdBy: z.string().optional()
});

export const updateRoundSchema = z.object({
  notes: z.string().optional(),
  placements: z.array(placementSchema)
    .optional()
    .refine(
      (placements: { teamId: string; place: number | "DQ" }[] | undefined) => 
        !placements || new Set(placements.map((p: { teamId: string }) => p.teamId)).size === placements.length,
      "Each team can only appear once in placements"
    )
});

// Session schemas
export const createSessionSchema = z.object({
  divisionId: z.string().min(1, "Division ID is required"),
  status: z.enum(["setup", "running", "finished"]).default("setup")
});

export const updateSessionSchema = z.object({
  status: z.enum(["setup", "running", "finished"])
});

// Query parameter schemas
export const sessionQuerySchema = z.object({
  id: z.string().min(1, "Session ID is required")
});

// Types
export type CreateRoundInput = z.infer<typeof createRoundSchema>;
export type UpdateRoundInput = z.infer<typeof updateRoundSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionQueryInput = z.infer<typeof sessionQuerySchema>;
export type Placement = z.infer<typeof placementSchema>;