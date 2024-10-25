import type { ITeam } from "@webfoot/core/models/types";
import { clamp } from "@webfoot/utils/math";

import type { IMoraleChangeProcessor } from "../interfaces";

type Params = {
  /** The amount of morale gained after a win (positive increases, negative decreases) */
  moraleBoostWin: number;
  /** The amount of morale gained after a loss (positive increases, negative decreases) */
  moraleBoostLoss: number;
  /** The amount of morale gained after a draw (positive increases, negative decreases) */
  moraleBoostDraw: number;

  // Ideally these parameters should live in a Team class, but for now it's fine
  /** The max morale assignable to a team */
  maxMorale: number;
  /** The min morale assignable to a team */
  minMorale: number;
};

export default class MoraleChangeProcessor implements IMoraleChangeProcessor {
  constructor(private readonly params: Params) {}

  calculateNewMorale(oldMorale: ITeam["id"], result: "W" | "D" | "L") {
    const { maxMorale, minMorale } = this.params;
    if (result === "W") {
      return clamp(oldMorale + this.params.moraleBoostWin, minMorale, maxMorale);
    }
    if (result === "L") {
      return clamp(oldMorale + this.params.moraleBoostLoss, minMorale, maxMorale);
    }
    return clamp(oldMorale + this.params.moraleBoostDraw, minMorale, maxMorale);
  }
}
