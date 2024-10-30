import type { IPlayer } from "@webfoot/core/models/types";
import { randomInt } from "@webfoot/utils/math";

import type { IRedCardStoryProcessor } from "../interfaces";

type Params = {
  /** How much the time when the redcard occurred affects the suspension time */
  baseTimeFactor: number;
  /** How much the player's discipline affects the suspension time (should be greater than 10) */
  baseDisciplineFactor: number;
  /**
   * Player's discipline multiplier to define suspension time
   * (must be 1 - timeInfluenceMultiplier) */
  disciplineInfluenceMultiplier: number;
  /**
   * Match's time when fault occured multiplier to define suspension time
   * (must be 1 - disciplineInfluenceMultiplier) */
  timeInfluenceMultiplier: number;
  /** Multiplier to define the likelihood of a most severe fault to the combined discipline and time factors */
  combinedFactorMultiplierMostSevere: number;
  /** Multiplier to define the likelihood of a severe fault to the combined discipline and time factors */
  combinedFactorMultiplierSevere: number;
  /** Multiplier to define the likelihood of a moderate fault to the combined discipline and time factors */
  combinedFactorMultiplierModerate: number;
  /** Maximum number of days a player can be suspended */
  maxSuspensionTime: number;
};

export default class RedCardStoryProcessor implements IRedCardStoryProcessor {
  constructor(private readonly params: Params) {}

  calculateSuspensionPeriod(player: IPlayer, redCardTime: number) {
    // More indisciplined players tend to make more violent faults
    const disciplineFactor = (this.params.baseDisciplineFactor - player.discipline) / 10;
    // Earlier redcards must have been a more violent fault
    const timeFactor = (90 - redCardTime) / 90 + this.params.baseTimeFactor;

    const combinedFactor =
      this.params.disciplineInfluenceMultiplier * disciplineFactor +
      this.params.timeInfluenceMultiplier * timeFactor;

    const rand = Math.random();

    if (rand < combinedFactor * this.params.combinedFactorMultiplierMostSevere) {
      return this.params.maxSuspensionTime;
    } else if (rand < combinedFactor * this.params.combinedFactorMultiplierSevere) {
      return this.params.maxSuspensionTime - 1;
    } else if (rand < combinedFactor * this.params.combinedFactorMultiplierModerate) {
      return this.params.maxSuspensionTime - 2;
    } else {
      return 1;
    }
  }
}
