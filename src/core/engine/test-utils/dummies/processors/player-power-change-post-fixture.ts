import type { IPlayerPowerChangePostFixtureProcessor } from "@webfoot/core/engine/interfaces";
import type { IPlayer } from "@webfoot/core/models/types";
import { clamp } from "@webfoot/utils/math";

export default class DummyPlayerPowerChangePostFixtureProcessor
  implements IPlayerPowerChangePostFixtureProcessor
{
  constructor(private readonly delta: number = 0) {}

  calculateNewPower(player: IPlayer, _playedTime: number, _injuryPeriod: number) {
    return clamp(player.power + this.delta, 1, 50);
  }
}
