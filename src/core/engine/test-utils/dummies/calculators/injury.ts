import type { IInjuryCalculator } from "@webfoot/core/engine/interfaces";
import type { IPlayer } from "@webfoot/core/models/types";

export default class DummyInjuryCalculator implements IInjuryCalculator {
  constructor(private readonly returnType: boolean = false) {}

  calculate(_player: IPlayer) {
    return this.returnType;
  }
}
