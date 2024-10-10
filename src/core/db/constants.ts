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
