import type { IPlayer } from "@webfoot/core/models/types";
import { randomInt } from "@webfoot/utils/math";

import {
  ATTACKER_POWER_MULTIPLIER,
  BASE_GOAL_MULTIPLIER,
  DEFENDER_GOAL_MULTIPLIER,
  GOALKEEPER_GOAL_MULTIPLIER,
  MIDFIELDER_GOAL_MULTIPLIER,
  STAR_GOAL_MULTIPLIER,
} from "./constants";

export default function calculateScorer(squad: IPlayer[]) {
  const weightedPlayers: number[] = [];
  squad.forEach((player) => {
    let weight: number;
    const powerMultiplier = player.star ? STAR_GOAL_MULTIPLIER : BASE_GOAL_MULTIPLIER;
    switch (player.position) {
      case "G": {
        weight = player.power * GOALKEEPER_GOAL_MULTIPLIER * powerMultiplier;
        break;
      }
      case "D": {
        weight = player.power * DEFENDER_GOAL_MULTIPLIER * powerMultiplier;
        break;
      }
      case "M": {
        weight = player.power * MIDFIELDER_GOAL_MULTIPLIER * powerMultiplier;
        break;
      }
      case "A": {
        weight = player.power * ATTACKER_POWER_MULTIPLIER * powerMultiplier;
        break;
      }
      default: {
        console.error({
          player,
          squad,
        });
      }
    }
    for (let i = 0; i < weight!; ++i) weightedPlayers.push(player.id);
  });
  const randomIndex = randomInt(0, weightedPlayers.length);
  const scorerId = weightedPlayers[randomIndex];
  return squad.find((player) => player.id === scorerId)!;
}
