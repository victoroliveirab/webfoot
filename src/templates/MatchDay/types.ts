import type Simulator from "@webfoot/core/engine/simulator";
import type { IFixture, IPlayer, ITeam } from "@webfoot/core/models/types";

export type ModalTeamInfo = {
  fixtureId: IFixture["id"];
  oppositionId: ITeam["id"];
  teamId: ITeam["id"];
} | null;

export type ModalInjuryInfo = {
  fixtureId: IFixture["id"];
  playerId: IPlayer["id"];
  teamId: ITeam["id"];
} | null;

export type LastOccuranceData = Simulator["lastOccurance"] & {
  player: IPlayer;
};
