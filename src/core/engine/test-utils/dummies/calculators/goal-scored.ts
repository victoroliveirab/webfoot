import type { IGoalScoredCalculator } from "@webfoot/core/engine/interfaces";
import type { IPlayer } from "@webfoot/core/models/types";
import { pickRandom } from "@webfoot/utils/array";

export default class DummyGoalScoredCalculator implements IGoalScoredCalculator {
  constructor(private readonly returnType: boolean = false) {}
  calculate(squad: IPlayer[], _teamAttack: number, _opponentDefense: number) {
    if (this.returnType === false) {
      return {
        goal: false as const,
      };
    }
    return {
      goal: true as const,
      scorer: pickRandom(squad),
    };
  }
}
