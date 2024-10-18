import type { IPlayer } from "@webfoot/core/models/types";
import { normalRandomInt } from "@webfoot/utils/math";

import {
  INJURY_PRONENESS_TIME_FACTOR_MULTIPLIER,
  PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
} from "./constants";

export default function calculateInjuredTime(player: IPlayer) {
  const injuryProneness = player.internal.injuryProneness;
  const previousInjuries = player.stats.injuries;

  const combinedFactor =
    injuryProneness * INJURY_PRONENESS_TIME_FACTOR_MULTIPLIER +
    previousInjuries * PREVIOUS_INJURIES_FACTOR_MULTIPLIER;
  const time = normalRandomInt(1, Math.ceil(combinedFactor));
  return time;
}
