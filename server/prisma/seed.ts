// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { IdGenerator } from '../src/services/idGenerator'

const prisma = new PrismaClient()

async function main() {

  // Create Church
  const church = await prisma.church.create({
    data: {
      id: 'ECC-RED-DEV',
      name: 'Evangelical Chinese Church',
    },
  })

  // Create Divisions with readable IDs
  const tnt = await prisma.division.create({
    data: {
      id: 'tnt',
      name: 'T&T',
      churchId: church.id,
    },
  })

  const sparks = await prisma.division.create({
    data: {
      id: 'sparks',
      name: 'Sparks',
      churchId: church.id,
    },
  })

  // Create Teams for T&T
  const tntTeams = await Promise.all([
    prisma.team.create({ 
      data: { 
        id: 'tnt-red',
        color: 'Red', 
        divisionId: tnt.id 
      } 
    }),
    prisma.team.create({ 
      data: { 
        id: 'tnt-blue',
        color: 'Blue', 
        divisionId: tnt.id 
      } 
    }),
    prisma.team.create({ 
      data: { 
        id: 'tnt-yellow',
        color: 'Yellow', 
        divisionId: tnt.id 
      } 
    }),
    prisma.team.create({ 
      data: { 
        id: 'tnt-green',
        color: 'Green', 
        divisionId: tnt.id 
      } 
    }),
  ])

  // Create Teams for Sparks
  const sparksTeams = await Promise.all([
    prisma.team.create({ 
      data: { 
        id: 'sparks-red',
        color: 'Red', 
        divisionId: sparks.id 
      } 
    }),
    prisma.team.create({ 
      data: { 
        id: 'sparks-blue',
        color: 'Blue', 
        divisionId: sparks.id 
      } 
    }),
    prisma.team.create({ 
      data: { 
        id: 'sparks-yellow',
        color: 'Yellow', 
        divisionId: sparks.id 
      } 
    }),
    prisma.team.create({ 
      data: { 
        id: 'sparks-green',
        color: 'Green', 
        divisionId: sparks.id 
      } 
    }),
  ])

  // Create Game with readable ID
  const games = await Promise.all([
    prisma.game.create({
      data: {
        id: 'baton-relay',
        name: 'Baton Relay',
        notes: 'Classic relay race with batons'
      }
    }),
    prisma.game.create({
      data: {
        id: 'three-legged-race',
        name: 'Three-Legged Race',
        notes: 'Classic race, partners tie ankles together'
      }
    }),
    prisma.game.create({
      data: {
        id: 'scooter-relay',
        name: 'Scooter Relay',
        notes: 'Relay race with scooters'
      }
    }),
    prisma.game.create({
      data: {
        id: 'tug-of-war',
        name: 'Tug-of-War',
        notes: 'Classic 4-team with circular rope'
      }
    })
  ]);

  // Create a Session with new ID format (for T&T)
  const sessionDate = new Date()
  const sessionId = await IdGenerator.generateSessionId(prisma, tnt.id, sessionDate)
  
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      divisionId: tnt.id,
      date: sessionDate,
      status: 'running',
      createdBy: 'seed-script',
      teamScores: {
        create: tntTeams.map(team => ({
          teamId: team.id,
          memberCount: 5,
          totalPoints: 0,
          roundsPlayed: 0
        })),
      },
    },
    include: {
      teamScores: true,
    },
  })

  console.log('Database seeded:')
  console.log('Church:', church)
  console.log('Divisions:', { tnt, sparks })
  console.log('T&T Teams:', tntTeams)
  console.log('Sparks Teams:', sparksTeams)
  console.log('Game:', games)
  console.log('Session:', session)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })