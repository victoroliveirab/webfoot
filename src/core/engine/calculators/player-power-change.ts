import type { IPlayer } from "@webfoot/core/models/types";

import type Simulator from "../simulator";
import {
  CONSTANT_FACTOR_POWER_DECREASE,
  CONSTANT_FACTOR_POWER_INCREASE,
  INCREASE_POWER_PROBABILITY_NOT_USED_PLAYER,
  LINEAR_FACTOR_POWER_DECREASE,
  LINEAR_FACTOR_POWER_INCREASE,
  QUADRATIC_FACTOR_POWER_DECREASE,
  QUADRATIC_FACTOR_POWER_INCREASE,
} from "./constants";
import { clamp, normalRandomInt, quadraticFunctionFactory } from "@webfoot/utils/math";

const powerIncreaseFn = quadraticFunctionFactory(
  QUADRATIC_FACTOR_POWER_INCREASE,
  LINEAR_FACTOR_POWER_INCREASE,
  CONSTANT_FACTOR_POWER_INCREASE,
);
const powerDecreaseFn = quadraticFunctionFactory(
  QUADRATIC_FACTOR_POWER_DECREASE,
  LINEAR_FACTOR_POWER_DECREASE,
  CONSTANT_FACTOR_POWER_DECREASE,
);

export function calculatePlayerPowerChangePostFixture(
  player: IPlayer,
  playedTime: number,
  injuryPeriod: number = 0,
) {
  // Player did not play (either sit on the bench the whole match or was not selected)
  if (playedTime === 0) {
    return Math.random() < INCREASE_POWER_PROBABILITY_NOT_USED_PLAYER
      ? clamp(player.power + 1, 1, 50)
      : player.power;
  }
  if (injuryPeriod === 0) {
    // Player participated and did not get injured
    if (playedTime < 45) {
      // Player participated for, at most, half time
      const probability = powerIncreaseFn(playedTime);
      return Math.random() < probability ? clamp(player.power + 1, 1, 50) : player.power;
    }
    // Player participated for more than 90 minutes
    const probability = powerDecreaseFn(playedTime);
    return Math.random() < probability ? clamp(player.power - 1, 1, 50) : player.power;
  }
  // Player participated and got injured in the process
  const randomFactor = normalRandomInt(3, 10);
  const powerLoss = injuryPeriod * randomFactor;
  return clamp(player.power - powerLoss, 1, 50);
}

export function calculatePlayerPowerChangePostFixtureX(
  simulation: Simulator,
  player: IPlayer,
  injuryPeriod: number = 0,
): number {
  const squadRecord =
    player.teamId === simulation.fixture.homeId ? simulation.squads.home : simulation.squads.away;

  if (squadRecord.bench.find(({ id }) => id === player.id)) {
    // Player started on the bench and didn't leave bench the whole match
    return Math.random() < INCREASE_POWER_PROBABILITY_NOT_USED_PLAYER
      ? clamp(player.power + 1, 1, 50)
      : player.power;
  }
  if (squadRecord.playing.find(({ id }) => id === player.id)) {
    // Player finished match playing
    const cameInTime =
      simulation.occurances.find(
        ({ type, playerId }) => type === "SUBSTITUTION" && playerId === player.id,
      )?.time ?? 0;
    const playedTime = simulation.scoreline.length - 1 - cameInTime;
    if (playedTime <= 45) {
      const probability =
        INCREASE_POWER_FACTOR_USED_PLAYER - (INCREASE_POWER_FACTOR_USED_PLAYER * playedTime) / 45;
      return Math.random() < probability ? clamp(player.power + 1, 1, 50) : player.power;
    }
    const probability =
      DECREASE_POWER_FACTOR_USER_PLAYER - (DECREASE_POWER_FACTOR_USER_PLAYER * playedTime) / 90;
    return Math.random() < probability ? clamp(player.power - 1, 1, 50) : player.power;
  }

  // Player didn't finish match, but participated
  // IMPLEMENT ME

  return player.power;
}
