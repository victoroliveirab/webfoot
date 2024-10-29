import type { IMoraleChangeProcessor } from "@webfoot/core/engine/interfaces";
import type { ITeam } from "@webfoot/core/models/types";

export default class DummyMoraleChangeProcessor implements IMoraleChangeProcessor {
  constructor(private readonly delta: number = 0.1) {}

  calculateNewMorale(oldMorale: ITeam["id"], _result: "W" | "D" | "L") {
    return oldMorale + this.delta;
  }
}
