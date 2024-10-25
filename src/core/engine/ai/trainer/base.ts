import { IPlayer, ITeam } from "@webfoot/core/models/types";

import type { AITrainerParams } from ".";
import type { SquadRecord } from "../../types";

export default abstract class AITrainer {
  protected readonly getters: AITrainerParams["getters"];
  readonly teamId: ITeam["id"];
  constructor(params: AITrainerParams) {
    this.getters = params.getters;
    this.teamId = params.teamId;
  }

  protected isTeamWinning() {
    const [homeGoals, awayGoals] = this.getters.currentScoreline();
    if (this.getters.isHomeTeam()) return homeGoals > awayGoals;
    return awayGoals > homeGoals;
  }

  protected isTeamLosing() {
    const [homeGoals, awayGoals] = this.getters.currentScoreline();
    if (this.getters.isHomeTeam()) return homeGoals < awayGoals;
    return awayGoals < homeGoals;
  }

  protected playersSortedByPowerAndPosition(
    players: IPlayer[],
  ): Record<IPlayer["position"], IPlayer[]> {
    const playersSorted: Record<IPlayer["position"], IPlayer[]> = {
      G: [],
      D: [],
      M: [],
      A: [],
    };
    for (const currentPlayer of players) {
      const arr = playersSorted[currentPlayer.position];
      let index = 0;
      for (; index < arr.length; ++index) {
        const player = arr[index];
        if (player.power < currentPlayer.power) {
          break;
        }
      }
      arr.splice(index, 0, currentPlayer);
    }
    return playersSorted;
  }

  abstract pickFixtureSquad(teamPlayers: IPlayer[]): Omit<SquadRecord, "out">;
  abstract decideSubstitutionPostInjury(injuredPlayer: IPlayer): IPlayer | null;
  abstract decideSubstitutionPostRedcard(
    sentOffPlayer: IPlayer,
  ): { playerIn: IPlayer; playerOut: IPlayer } | null;
}
