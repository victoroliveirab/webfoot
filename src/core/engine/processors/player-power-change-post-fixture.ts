import type { IPlayer } from "@webfoot/core/models/types";
import { clamp, normalRandomInt } from "@webfoot/utils/math";

import type { IPlayerPowerChangePostFixtureProcessor } from "../interfaces";

type Params = {
  /** Function to calculate the probability of a player decreasing power after a match */
  powerDecreaseProbabilityCalculator: (playedTime: number) => number;
  /** Function to calculate the probability of a player increasing power after a match */
  powerIncreaseProbabilityCalculator: (playedTime: number) => number;
  /** The likelyhood of a player that didn't play to increase his power */
  probabilityPlayerNotUsedIncreasePower: number;
  /** The maximum time a player can play in order to increase his power */
  increaseVsDecreaseTimeThreshold: number;
  /** How much getting injured affects the amount of power decreasing */
  powerDecreaseInjuryFactor: number;
};

export default class PlayerPowerChangePostFixtureProcessor
  implements IPlayerPowerChangePostFixtureProcessor
{
  constructor(private readonly params: Params) {}

  private notUsedPlayerCalculator(player: IPlayer) {
    if (Math.random() < this.params.probabilityPlayerNotUsedIncreasePower) {
      return clamp(player.power + 1, 1, 50);
    }
    return player.power;
  }

  private underUsedPlayerCalculator(player: IPlayer, playedTime: number) {
    const probability = this.params.powerIncreaseProbabilityCalculator(playedTime);
    if (Math.random() < probability) {
      return clamp(player.power + 1, 1, 50);
    }
    return player.power;
  }

  private overUsedPlayerCalculator(player: IPlayer, playedTime: number) {
    const probability = this.params.powerDecreaseProbabilityCalculator(playedTime);
    if (Math.random() < probability) {
      return clamp(player.power - 1, 1, 50);
    }
    return player.power;
  }

  calculateNewPower(player: IPlayer, playedTime: number, injuryPeriod: number = 0) {
    // Player did not play (either sit on the bench the whole match or was not selected)
    if (playedTime === 0) return this.notUsedPlayerCalculator(player);

    // Player participated and did not get injured
    if (injuryPeriod === 0) {
      if (playedTime <= this.params.increaseVsDecreaseTimeThreshold)
        return this.underUsedPlayerCalculator(player, playedTime);
      else return this.overUsedPlayerCalculator(player, playedTime);
    }

    // Player participated and got injured in the process
    const randomFactor = normalRandomInt(2, 9);
    const powerLoss = Math.round(
      this.params.powerDecreaseInjuryFactor * injuryPeriod * randomFactor,
    );
    return clamp(player.power - powerLoss, 1, 50);
  }
}
