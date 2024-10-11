import type Simulator from "@webfoot/core/engine/simulator";
import type { IFixture } from "@webfoot/core/models/types";

export type SimulationsSignal = {
  clock: number;
  simulations: Record<IFixture["id"], Simulator> | null;
};
