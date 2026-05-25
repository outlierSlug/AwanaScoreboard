import { PrismaClient } from '@prisma/client';

// Create one PrismaClient instance and reuse it across the app.
// Exporting a single instance prevents multiple DB pools from being opened.
const prisma = new PrismaClient();

export default prisma;