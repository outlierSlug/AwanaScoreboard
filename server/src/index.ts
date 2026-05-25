import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prismaClient";
import { createSessionRouter } from "./routes/sessionRoutes";
import { createRoundRouter } from "./routes/roundRoutes";
import { createGameRouter } from './routes/gameRoutes';

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

// Routes
app.use("/sessions", createSessionRouter(prisma));
app.use("/rounds", createRoundRouter(prisma));
app.use('/games', createGameRouter(prisma));

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("DB disconnected");
  process.exit(0);
});
