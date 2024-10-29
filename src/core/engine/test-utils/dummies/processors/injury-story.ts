import type { IInjuryStoryProcessor } from "@webfoot/core/engine/interfaces";
import type { IPlayer } from "@webfoot/core/models/types";

export default class DummyInjuryStoryProcessor implements IInjuryStoryProcessor {
  constructor(private readonly time: number = 1) {}

  calculateInjuryPeriod(_player: IPlayer, _matchTime: number) {
    return this.time;
  }
}
