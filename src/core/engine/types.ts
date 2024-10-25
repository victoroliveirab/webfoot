import type { IPlayer } from "../models/types";

export type SquadRecord = {
  playing: IPlayer[];
  bench: IPlayer[];
  out: IPlayer[];
};

export type AITrainerStrategy = "Standard";
