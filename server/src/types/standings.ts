export type TeamStanding = {
  teamId: string
  color: string
  totalPoints: number
  roundsPlayed: number
  averagePoints: number
  firstPlaces: number
  secondPlaces: number
  thirdPlaces: number
  fourthPlaces: number
  disqualifications: number
  currentRank: number
}

export type SessionStandings = {
  sessionId: string
  divisionId: string
  roundsCompleted: number
  lastUpdated: string
  teams: TeamStanding[]
}