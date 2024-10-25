import type { IRedCardStoryProcessor } from "@webfoot/core/engine/interfaces";
import type { IPlayer } from "@webfoot/core/models/types";

export default class DummyRedCardStoryProcessor implements IRedCardStoryProcessor {
  constructor(private readonly time: number = 1) {}

  calculateSuspensionPeriod(_player: IPlayer, _redCardTime: number) {
    return this.time;
  }
}
