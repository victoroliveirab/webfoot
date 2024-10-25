import type { IPlayer } from "@webfoot/core/models/types";

import type { IRedCardCalculator } from "../interfaces";

type Params = {
  /** Baseline to calculate red card probability from */
  redCardProbabilityBaseline: number;
  /** How much the discipline value of a player influences the probability */
  disciplineMultiplier: number;
  /** How much a player not being a star influences the probability */
  nonStarMultiplier: number;
  /** How much a player being a star influences the probability */
  starMultiplier: number;
};

export default class RedCardCalculator implements IRedCardCalculator {
  constructor(private readonly params: Params) {}

  calculate(player: IPlayer) {
    const starMultiplier = player.star ? this.params.starMultiplier : this.params.nonStarMultiplier;
    const value =
      starMultiplier *
      this.params.redCardProbabilityBaseline *
      ((11 - player.discipline) / this.params.disciplineMultiplier);
    return Math.random() < value;
  }
}
