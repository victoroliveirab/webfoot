import type { IPlayer } from "@webfoot/core/models/types";

export default class PlayerStub {
  instance: IPlayer;
  constructor(params: Partial<IPlayer>) {
    this.instance = {
      id: params.id ?? 0,
      available: params.available ?? true,
      discipline: params.discipline ?? 0,
      injuryPeriod: params.injuryPeriod ?? 0,
      internal: params.internal ?? {
        injuryProneness: 0,
      },
      name: params.name ?? "Foo",
      position: params.position ?? "A",
      power: params.power ?? 1,
      salary: params.salary ?? 0,
      suspensionPeriod: params.suspensionPeriod ?? 0,
      stats: params.stats ?? {
        games: 0,
        goals: 0,
        injuries: 0,
        redcards: 0,
        seasonGoals: 0,
      },
      star: params.star ?? false,
      teamId: params.teamId ?? 1,
    };
  }
}
