import type { IPlayer } from "@webfoot/core/models/types";
import { normalRandomInt } from "@webfoot/utils/math";

import type { IInjuryStoryProcessor } from "../interfaces";

type Params = {
  /** Player's injury proneness influence on the injury time */
  injuryPronenessMultiplier: number;
  /** Player's past injuries influence on the injury time */
  previousInjuriesMultiplier: number;
  /** Match's time player got injured influence on the injury time */
  timeOfInjuryMultiplier: number;
  /** Max time a player can stay injured */
  maxTimeInjured: number;
};

export default class InjuryStoryProcessor implements IInjuryStoryProcessor {
  constructor(private readonly params: Params) {}

  calculateInjuryPeriod(player: IPlayer, matchTime: number) {
    const playerInjuryProneness = player.internal.injuryProneness;
    const numberOfPreviousInjuries = player.stats.injuries;
    const combinedFactor =
      playerInjuryProneness * this.params.injuryPronenessMultiplier +
      numberOfPreviousInjuries * this.params.previousInjuriesMultiplier +
      (90 - matchTime) * this.params.timeOfInjuryMultiplier;

    const time = normalRandomInt(1, Math.max(2, Math.ceil(combinedFactor)));
    return Math.min(time, this.params.maxTimeInjured);
  }
}
