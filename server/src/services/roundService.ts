// src/services/roundServices.ts
export type PlacementInput = {
  teamId: string;
  place: number | null; // null if not placed
  dq: boolean;
};

export type PlacementWithPoints = PlacementInput & {
  pointsAwarded: number;
};

export function calculatePoints(placements: PlacementInput[]): PlacementWithPoints[] {
  const basePoints = [40, 30, 20, 10]; // scoring table

  const grouped = new Map<number, PlacementInput[]>();
  placements.forEach((p) => {
    if (p.place !== null) {
      if (!grouped.has(p.place)) grouped.set(p.place, []);
      grouped.get(p.place)!.push(p);
    }
  });

  const sortedPlaces = Array.from(grouped.keys()).sort((a, b) => a - b);

  let currentSlot = 1;
  const results: PlacementWithPoints[] = [];

  for (const place of sortedPlaces) {
    const group = grouped.get(place)!;
    const groupSize = group.length;

    const slots = basePoints.slice(currentSlot - 1, currentSlot - 1 + groupSize);
    const avgPoints =
      slots.length > 0 ? slots.reduce((a, b) => a + b, 0) / groupSize : 0;

    for (const team of group) {
      results.push({
        ...team,
        pointsAwarded: team.dq ? 0 : avgPoints,
      });
    }

    currentSlot += groupSize;
  }

  placements
    .filter((p) => p.place === null)
    .forEach((p) =>
      results.push({ ...p, pointsAwarded: 0 })
    );

  return results;
}


