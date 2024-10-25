import type { IPlayer } from "@webfoot/core/models/types";

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

export function getPlayerPositionSortValue(player: IPlayer) {
  if (player.position === "G") return 3;
  if (player.position === "D") return 2;
  if (player.position === "M") return 1;
  return 0;
}

export function getSmallestPowerOfEachPosition(players: IPlayer[]) {
  const worstByPosition: Record<IPlayer["position"], IPlayer | null> = {
    G: null,
    D: null,
    M: null,
    A: null,
  };
  for (const player of players) {
    if (!worstByPosition[player.position]) worstByPosition[player.position] = player;
    else if (worstByPosition[player.position]!.power > player.power)
      worstByPosition[player.position] = player;
    else if (worstByPosition[player.position]!.star && !player.star)
      worstByPosition[player.position] = player;
  }
  return worstByPosition;
}

export function getGreatestPowerOfEachPosition(players: IPlayer[]) {
  const bestByPosition: Record<IPlayer["position"], IPlayer | null> = {
    G: null,
    D: null,
    M: null,
    A: null,
  };
  for (const player of players) {
    if (!bestByPosition[player.position]) bestByPosition[player.position] = player;
    else if (bestByPosition[player.position]!.power < player.power)
      bestByPosition[player.position] = player;
    else if (!bestByPosition[player.position]!.star && player.star)
      bestByPosition[player.position] = player;
  }
  return bestByPosition;
}
export function getGreatestPower(players: IPlayer[]) {
  if (players.length === 0) return null;
  let bestPlayer = players[0];
  for (let i = 1; i < players.length; ++i) {
    const player = players[i];
    if (bestPlayer.power < player.power) {
      bestPlayer = player;
    } else if (bestPlayer.power === player.power) {
      if (!bestPlayer.star && player.star) {
        bestPlayer = player;
      }
    }
  }
  return bestPlayer;
}
