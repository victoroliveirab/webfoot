import type Simulator from "@webfoot/core/engine/simulator";
import type { IFixture, ITeam } from "@webfoot/core/models/types";

export type SimulationsSignal = {
  clock: number;
  simulations: Record<IFixture["id"], Simulator> | null;
};

export type ModalTeamInfo = {
  fixtureId: IFixture["id"];
  oppositionId: ITeam["id"];
  teamId: ITeam["id"];
} | null;
