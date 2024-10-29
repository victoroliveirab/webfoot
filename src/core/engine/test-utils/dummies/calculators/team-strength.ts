import { ITeamStrengthCalculator } from "@webfoot/core/engine/interfaces";
import { IPlayer } from "@webfoot/core/models/types";

export default class DummyTeamStrengthCalculator implements ITeamStrengthCalculator {
  constructor(private readonly method = (squad: IPlayer[]) => 0) {}

  calculate(squad: IPlayer[], _morale: number) {
    return {
      attack: this.method(squad),
      defense: this.method(squad),
    };
  }
}
