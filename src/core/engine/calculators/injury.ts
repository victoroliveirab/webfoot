import type { IPlayer } from "@webfoot/core/models/types";

import type { IInjuryCalculator } from "../interfaces";

type Params = {
  /** Baseline to calculate injury probability from */
  injuryProbabilityBaseline: number;
  /** How much the injury proneness value of a player influences the probability */
  injuryPronenessMultiplier: number;
  /** How much having been previously injured influences the probability */
  pastInjuryMultiplier: number;
  /** The maximum probability of being injured */
  maxInjuryProbability: number;
  /** How much a player not being a star influences the probability */
  nonStarMultiplier: number;
  /** How much a player being a star influences the probability */
  starMultiplier: number;
};

export default class InjuryCalculator implements IInjuryCalculator {
  constructor(private readonly params: Params) {}

  calculate(player: IPlayer) {
    const starMultiplier = player.star ? this.params.starMultiplier : this.params.nonStarMultiplier;
    let value =
      starMultiplier * this.params.injuryProbabilityBaseline +
      this.params.injuryPronenessMultiplier * player.internal.injuryProneness;
    if (player.stats.injuries > 0) {
      value *= this.params.pastInjuryMultiplier;
    }
    return Math.random() < Math.min(value, this.params.maxInjuryProbability);
  }
}

// export default function calculateInjuryPlayer(player: IPlayer) {
//   const injuryProbability =
//     INJURY_BASELINE + INJURY_PRONENESS_MULTIPLIER * player.internal.injuryProneness;
//   return Math.random() < injuryProbability;
// }
