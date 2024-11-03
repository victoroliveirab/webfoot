import type { IPlayer } from "@webfoot/core/models/types";

import type { IInjuryCalculator } from "../interfaces";

type Params = {
  /** Baseline to calculate injury probability from */
  injuryProbabilityBaseline: number;
  /** How much the injury proneness value of a player influences the probability */
  injuryPronenessSlope: number;
  /** How much having been previously injured influences the probability */
  pastInjuryMultiplier: number;
  /** The maximum probability of being injured */
  maxInjuryProbability: number;
  /** How much a player not being a star influences the probability (should be close to 1.0) */
  nonStarMultiplier: number;
  /** How much a player being a star influences the probability (should be close to 1.0) */
  starMultiplier: number;
};

export default class InjuryCalculator implements IInjuryCalculator {
  constructor(private readonly params: Params) {}

  calculate(player: IPlayer) {
    const starMultiplier = player.star ? this.params.starMultiplier : this.params.nonStarMultiplier;
    const baseProbability = starMultiplier * this.params.injuryProbabilityBaseline;
    const additionalProbabilityInjuryProneness =
      this.params.injuryPronenessSlope * player.internal.injuryProneness;
    const additionalProbabilityPastInjuries =
      this.params.pastInjuryMultiplier * player.stats.injuries;
    const probability =
      baseProbability + additionalProbabilityPastInjuries + additionalProbabilityInjuryProneness;

    return Math.random() < Math.min(probability, this.params.maxInjuryProbability);
  }
}
