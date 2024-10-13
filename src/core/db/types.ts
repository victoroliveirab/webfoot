type ID = number;
type IDHash = `${ID}-${ID}`;

export type ORMBlueprint<T extends { id: number }, I extends keyof T = never> = {
  type: T;
  indexes: I;
};

export type League = ORMBlueprint<{
  id: ID;
  name: string;
  fullname: string;
  format: "championship";
}>;

export type Championship = ORMBlueprint<
  {
    id: ID;
    leagueId: ID;
    season: number;
    fixtures: number[][][];
    standings: ID[];
  },
  "leagueId" | "season"
>;

export type Team = ORMBlueprint<
  {
    id: ID;
    championshipId: ID | null;
    name: string;
    fullname: string;
    foreground: Color;
    background: Color;
    border: Color | "transparent";
    budgetId: ID;
    currentCash: number;
    currentStadiumCapacity: number;
    currentTicketCost: number;
    morale: number;
  },
  "championshipId" | "name"
>;

export type TeamBudget = ORMBlueprint<
  {
    id: ID;
    teamId: ID;
    earnings: {
      tickets: number;
      soldPlayers: number;
      prizes: number;
    };
    spendings: {
      salaries: number;
      boughtPlayers: number;
      stadium: number;
      interest: number;
    };
    year: number;
  },
  "teamId" | "year"
>;

type PlayerPosition = "G" | "D" | "M" | "A";
type PlayerStats = {
  games: number;
  goals: number;
  redcards: number;
  injuries: number;
  seasonGoals: number;
};
export type Player = ORMBlueprint<
  {
    id: ID;
    teamId: ID;
    available: boolean;
    name: string;
    position: PlayerPosition;
    power: number;
    discipline: number;
    salary: number;
    star: boolean;
    stats: PlayerStats;
    suspensionPeriod: number;
  },
  "teamId" | "name"
>;

export type Trainer = ORMBlueprint<
  {
    id: ID;
    name: string;
    teamId: ID | null;
    history: {
      description: string;
      season: number;
      teamId: ID;
      // TODO: add job_promotion and job_relegation for job changes between two trainers
      type: "join" | "promotion" | "relegation" | "title";
    }[];
    human: boolean;
  },
  "human" | "teamId"
>;

export type FixtureSquad = {
  firstTeam: Player["type"]["id"][];
  substitutes: Player["type"]["id"][];
};
export type Fixture = ORMBlueprint<
  {
    id: ID;
    championshipId: ID;
    homeId: ID;
    awayId: ID;
    homeAwayHash: IDHash;
    round: number;
    occurred: boolean;
    attendees: number;
    homeGoals: number;
    awayGoals: number;
    homeSquad: FixtureSquad;
    awaySquad: FixtureSquad;
  },
  "championshipId" | "homeId" | "awayId" | "homeAwayHash"
>;

export type Story =
  | {
      playerId: Player["type"]["id"];
      time: number;
      type: "GOAL_REGULAR" | "INJURY" | "PENALTI_SCORED" | "PENALTI_MISSED" | "REDCARD";
    }
  | {
      playerId: Player["type"]["id"];
      subbedPlayerId: Player["type"]["id"];
      time: number;
      type: "SUBSTITUTION";
    };

export type SimulationRecord = ORMBlueprint<
  {
    id: ID;
    fixtureId: Fixture["type"]["id"];
    story: Story[];
  },
  "fixtureId"
>;

export type Standing = ORMBlueprint<
  {
    id: ID;
    championshipId: ID;
    teamId: ID;
    wins: number;
    draws: number;
    losses: number;
    goalsPro: number;
    goalsAgainst: number;
    points: number;
  },
  "championshipId" | "teamId"
>;

export type Color =
  | "black"
  | "maroon"
  | "green"
  | "olive"
  | "darkblue"
  | "purple"
  | "teal"
  | "silver"
  | "gray"
  | "red"
  | "lime"
  | "yellow"
  | "blue"
  | "pink"
  | "cyan"
  | "white";
