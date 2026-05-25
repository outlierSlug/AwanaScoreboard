import { PrismaClient } from "@prisma/client";

export class IdGenerator {
    /**
     * Format: [Division Initial][MMDDYY] or [Division Initial][MMDDYY]x[n]
     */
    static async generateSessionId(
        prisma: PrismaClient,
        divisionId: string,
        date: Date
    ): Promise<string> {
        // Format: [Division Initial][MMDDYY]
        const divisionInitial = divisionId.charAt(0).toUpperCase();
        // Format date as MMDDYY
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = String(date.getFullYear()).slice(2);
        
        const baseId = `${divisionInitial}${month}${day}${year}`;

        // Check for existing sessions on this date
        const existingSessions = await prisma.session.findMany({
            where: {
                id: {
                    startsWith: baseId
                }
            }
        });

        // If no sessions exist, return base ID
        if (existingSessions.length === 0) {
            return baseId;
        }

        // Otherwise append increment
        return `${baseId}x${existingSessions.length + 1}`;
    }

    /**
     * Format: [divisionId]-[color]
     */
    static generateTeamId(divisionId: string, color: string): string {
        return `${divisionId}-${color.toLowerCase()}`;
    }

    /**
     * Format: [name with no spaces, all lowercase]
     */
    static generateDivisionId(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '');
    }

    /**
     * Format: CH-[3 uppercase letters][3 digits]
     */
    static generateChurchId(): string {
        // Generate a shorter, readable random ID
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const chars = Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]);
        const nums = Array.from({ length: 3 }, () => numbers[Math.floor(Math.random() * numbers.length)]);
        return `CH-${chars.join('')}${nums.join('')}`;
    }

    /**
     * Format: [name with spaces replaced by hyphens, all lowercase]
     */
    static generateGameId(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '-');
    }

    /**
     * Format: [sessionId]-[roundNumber]
     */
    static generateRoundId(sessionId: string, roundNumber: number): string {
        return `${sessionId}-${roundNumber}`;
    }

    /**
     * Format: [roundId]-[teamId]
     */
    static generateRoundResultId(roundId: string, teamId: string): string {
        return `${roundId}-${teamId}`;
    }

    /**
     * Format: [YYYYMMDDHHMMSS]-[action]
     */
    static generateAuditLogId(action: string): string {
        const timestamp = new Date().toISOString()
            .replace(/[-:\.]/g, '')
            .replace(/[T]/g, '')
            .slice(0, 14);
        return `${timestamp}-${action.toLowerCase()}`;
    }
}