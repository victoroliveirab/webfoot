import type {
  Championship,
  Fixture,
  FixtureSquad,
  League,
  Player,
  SimulationRecord,
  Standing,
  Team,
  TeamBudget,
} from "../db/types";

type Type<T extends { type: unknown }> = Pick<T, "type">["type"];

export type IChampionship = Type<Championship>;
export type IFixture = Type<Fixture>;
export type IFixtureSquad = FixtureSquad;
export type ILeague = Type<League>;
export type IPlayer = Type<Player>;
export type ISimulationRecord = Type<SimulationRecord>;
export type IStanding = Type<Standing>;
export type ITeam = Type<Team>;
export type ITeamBudget = Type<TeamBudget>;
