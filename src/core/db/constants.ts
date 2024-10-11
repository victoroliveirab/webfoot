export const TABLE_NAMES = {
  Championship: "championships",
  League: "leagues",
  Fixture: "fixtures",
  Player: "players",
  SimulationRecord: "simulationsRecords",
  Standing: "standings",
  Team: "teams",
  TeamBudget: "teamsBudgets",
  Trainer: "trainers",
} as const;

export type TableName = (typeof TABLE_NAMES)[keyof typeof TABLE_NAMES];

export const TEAMS_PER_DIVISION = 8;
export const INITIAL_MORALE = 0.5;
export const FIXTURES_8_TEAMS = [
  [
    [7, 1],
    [4, 3],
    [2, 8],
    [5, 6],
  ],
  [
    [8, 5],
    [1, 4],
    [3, 2],
    [6, 7],
  ],
  [
    [5, 1],
    [7, 3],
    [2, 6],
    [4, 8],
  ],
  [
    [1, 3],
    [2, 5],
    [6, 4],
    [8, 7],
  ],
  [
    [4, 5],
    [3, 6],
    [7, 2],
    [1, 8],
  ],
  [
    [2, 4],
    [5, 7],
    [6, 1],
    [8, 3],
  ],
  [
    [1, 2],
    [3, 5],
    [6, 8],
    [4, 7],
  ],
];

export const INITIAL_STADIUM_CAPACITY_BY_DIVISION = [60_000, 45_000, 30_000, 15_000, 10_000];
export const INITIAL_TICKET_PRICE_BY_DIVISION = [40, 25, 15, 8, 5];

export const DISCIPLINES_MAP: Record<number, string> = {
  0: "Sarrafeiro",
  2: "Caceteiro",
  4: "Caneleiro",
  6: "Cavalheiro",
  8: "Cordeirinho",
  10: "Fair Play",
} as const;
