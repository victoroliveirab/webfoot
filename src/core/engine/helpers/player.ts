import type { IPlayer } from "@webfoot/core/models/types";

export function getIsPlayerEligibleToPlay(player: IPlayer) {
  return player.suspensionPeriod === 0 && player.injuryPeriod === 0;
}
