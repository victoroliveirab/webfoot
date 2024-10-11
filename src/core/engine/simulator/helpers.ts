import type Simulator from ".";

export function getAllPlayersOnSimulator(simulation: Simulator) {
  return [
    ...simulation.squads.home.playing,
    ...simulation.squads.home.bench,
    ...simulation.squads.home.out,
    ...simulation.squads.away.playing,
    ...simulation.squads.away.bench,
    ...simulation.squads.away.out,
  ];
}
