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

// For now, let's ignore this and only pause the game to let player do whatever they want
// export type RequiredHumanAction = {
//   type: "GOALKEEPER_SENT_OFF" | "PLAYER_INJURED" | "HALFTIME" | "EXTRATIME";
//   playerId?: IPlayer["id"];
//   teamId: ITeam["id"];
// };
