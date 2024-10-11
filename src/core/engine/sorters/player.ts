import type { IPlayer } from "@webfoot/core/models/types";

export function playerSorterByPower(playerA: IPlayer, playerB: IPlayer) {
  if (playerA.power === playerB.power) {
    return Math.random() < 0.5 ? 1 : -1;
  }
  return playerA.power < playerB.power ? 1 : -1;
}
