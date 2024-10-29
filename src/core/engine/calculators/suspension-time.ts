import type { IPlayer } from "@webfoot/core/models/types";

import {
  BASE_TIME_FACTOR,
  COMBINED_FACTOR_MULTIPLIER_MODERATE,
  COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE,
  COMBINED_FACTOR_MULTIPLIER_SEVERE,
  DISCIPLINE_INFLUENCE_FACTOR,
  MAX_DAYS_SUSPENSION,
  MIN_DAYS_SUSPENSION,
  TIME_INFLUENCE_FACTOR,
} from "./constants";

export default function calculateSuspensionTime(player: IPlayer, redCardTime: number) {
  // More indisciplined players tend to make more violent faults
  const disciplineFactor = (10 - player.discipline) / 10;
  // Earlier redcards must have been a more violent fault
  const timeFactor = (90 - redCardTime) / 90 + BASE_TIME_FACTOR;

  const combinedFactor =
    DISCIPLINE_INFLUENCE_FACTOR * disciplineFactor + TIME_INFLUENCE_FACTOR * timeFactor;

  const rand = Math.random();

  if (rand < combinedFactor * COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE) {
    return MAX_DAYS_SUSPENSION;
  } else if (rand < combinedFactor * COMBINED_FACTOR_MULTIPLIER_SEVERE) {
    return MAX_DAYS_SUSPENSION - 1;
  } else if (rand < combinedFactor * COMBINED_FACTOR_MULTIPLIER_MODERATE) {
    return MIN_DAYS_SUSPENSION + 1;
  } else {
    return MIN_DAYS_SUSPENSION;
  }
}
