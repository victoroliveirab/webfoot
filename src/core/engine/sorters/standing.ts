import type { IStanding } from "@webfoot/core/models/types";

export default function standingSorter(standingA: IStanding, standingB: IStanding) {
  if (standingA.points !== standingB.points) {
    return standingA.points < standingB.points ? 1 : -1;
  }

  const goalDiffA = standingA.goalsPro - standingA.goalsAgainst;
  const goalDiffB = standingB.goalsPro - standingB.goalsAgainst;
  if (goalDiffA !== goalDiffB) {
    return goalDiffA < goalDiffB ? 1 : -1;
  }

  if (standingA.goalsPro !== standingB.goalsPro) {
    return standingA.goalsPro < standingB.goalsPro ? 1 : -1;
  }

  // All similar, perhaps include redcard(?)/number of victories etc.
  console.warn({
    standingA,
    standingB,
  });

  return 1;
}
