import type { IPlayer } from "@webfoot/core/models/types";
import { pickRandom } from "@webfoot/utils/array";

import type { IGoalScoredCalculator } from "../interfaces";

type Params = {
  /** Player's power multiplier to define probability of a goalkeeper being the scorer */
  goalkeeperGoalMultiplier: number;
  /** Player's power multiplier to define probability of a defender being the scorer */
  defenderGoalMultiplier: number;
  /** Player's power multiplier to define probability of a midfielder being the scorer */
  midfielderGoalMultiplier: number;
  /** Player's power multiplier to define probability of a attacker being the scorer */
  attackerGoalMultiplier: number;

  /** How much a player not being a star influences the probability */
  nonStarMultiplier: number;
  /** How much a player being a star influences the probability */
  starMultiplier: number;

  /** The minimum random factor to randomize strength values */
  randomFactorMinValue: number;
  /** The random factor range to randomize strength values */
  randomFactorRange: number;

  /** Scaling factor to opponent's defense (keep it the closest to 100.0 possible) */
  goalProbabilityScalingFactor: number;
};

export default class GoalScoredCalculator implements IGoalScoredCalculator {
  scalingFactors: Record<IPlayer["position"], number>;
  constructor(private readonly params: Params) {
    this.scalingFactors = {
      G: params.goalkeeperGoalMultiplier,
      D: params.defenderGoalMultiplier,
      M: params.midfielderGoalMultiplier,
      A: params.attackerGoalMultiplier,
    };
  }

  calculate(squad: IPlayer[], teamAttack: number, opponentDefense: number) {
    const randomTeamFactor =
      Math.random() * this.params.randomFactorRange + this.params.randomFactorMinValue;
    const randomOpponentFactor =
      Math.random() * this.params.randomFactorRange + this.params.randomFactorMinValue;
    const teamAttackRandomized = teamAttack * randomTeamFactor;
    const opponentDefenseRandomized = opponentDefense * randomOpponentFactor;

    const probabilityTeamScored =
      teamAttackRandomized / (opponentDefenseRandomized * this.params.goalProbabilityScalingFactor);
    const hasTeamScored = Math.random() < probabilityTeamScored;
    if (!hasTeamScored) {
      return {
        goal: false as const,
      };
    }

    // Team scored, calculate scorer
    const weightedPlayers: number[] = [];
    squad.forEach((player) => {
      const powerMultiplier = player.star
        ? this.params.starMultiplier
        : this.params.nonStarMultiplier;
      const weight = player.power * this.scalingFactors[player.position] * powerMultiplier || 0;
      for (let i = 0; i < weight; ++i) weightedPlayers.push(player.id);
    });
    const scorerId = pickRandom(weightedPlayers);
    const scorer = squad.find((player) => player.id === scorerId)!;
    return {
      goal: true as const,
      scorer,
    };
  }
}
