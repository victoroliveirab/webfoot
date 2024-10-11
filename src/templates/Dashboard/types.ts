import type { IPlayer } from "@webfoot/core/models/types";

export type DashboardSquad = {
  firstTeam: IPlayer[];
  substitutes: IPlayer[];
};

export type Tabs = "Game" | "Player" | "Finances" | "Selection" | "Opponent";

export type OpenedDropdown =
  | "Webfoot"
  | "Formation"
  | "Team"
  | "Player"
  | "Championship"
  | "Trainer"
  | null;
