import type { IPlayer } from "@webfoot/core/models/types";

import { INJURY_BASELINE, INJURY_PRONENESS_MULTIPLIER } from "./constants";

export default function calculateInjuryPlayer(player: IPlayer) {
  const injuryProbability =
    INJURY_BASELINE + INJURY_PRONENESS_MULTIPLIER * player.internal.injuryProneness;
  return Math.random() < injuryProbability;
}
