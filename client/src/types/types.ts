export type Placement = {
    teamId: string;
    place: number;
    dq: boolean;
}

export type Selection = {
    teamId: string;
    dq?: boolean;
}

export interface SessionScore {
    id: string;
    teamId: string;
    totalPoints: number;
    roundsPlayed: number;
    team: {
        color: string;
    };
}

export type Round = {
    id: string;
    roundNumber: number;
    results: Array<{
        teamId: string;
        place: number;
        pointsAwarded: number;
        note: string | null;
    }>;
};