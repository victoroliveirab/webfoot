import type { IPlayer } from "@webfoot/core/models/types";

import type {
  IInjuryTimeCalculator,
  IPlayerPowerChangePostFixtureCalculator,
  IPostRoundCalculator,
  ISuspensionTimeCalculator,
} from "../interfaces";
import type Simulator from "../simulator";
import { HashMap, PatchObject } from "@webfoot/utils/types";
import { arrayToHashMap } from "@webfoot/utils/array";
import { Fixture, Player, Team, TeamBudget } from "@webfoot/core/models";
import { clamp } from "@webfoot/utils/math";

type Params = {
  calculators: {
    injuryPeriod: IInjuryTimeCalculator;
    playerPowerChange: IPlayerPowerChangePostFixtureCalculator;
    suspensionPeriod: ISuspensionTimeCalculator;
  };
  getters: {
    attendees: () => Simulator["attendees"];
    finalScoreline: () => Simulator["currentScoreline"];
    fixture: () => Simulator["fixture"];
    occurances: () => Simulator["occurances"];
    morales: () => [Simulator["homeMorale"], Simulator["awayMorale"]];
    players: () => Simulator["players"];
    playedTimeByPlayersIds: () => Record<IPlayer["id"], number>;
  };

  /**
   * How much of the ticket money earned goes to the home team
   * Must be at most 1 - awayTeamTicketMoneyShare
   * Unused for now */
  homeTeamTicketMoneyShare: number;
  /**
   * How much of the ticket money earned goes to the away team
   * Must be at most 1 - homeTeamTicketMoneyShare
   * Unused for now */
  awayTeamTicketMoneyShare: number;

  /** The amount of morale gained after a win (positive increases, negative decreases) */
  moraleBoostWin: number;
  /** The amount of morale gained after a loss (positive increases, negative decreases) */
  moraleBoostLoss: number;
  /** The amount of morale gained after a draw (positive increases, negative decreases) */
  moraleBoostDraw: number;

  // Ideally these parameters should live in a Team class, but for now it's fine
  /** The max morale assignable to a team */
  maxMorale: number;
  /** The min morale assignable to a team */
  minMorale: number;
};

type UpdateStruct = {
  playerId: IPlayer["id"];
  goals?: number;
  injuryPeriod?: number;
  suspensionPeriod?: number;
};

export default class PostRoundCalculator implements IPostRoundCalculator {
  private playersHashMap: HashMap<IPlayer> = {};
  constructor(private readonly params: Params) {}

  private async preProcessFixtureOccurances() {
    this.playersHashMap = arrayToHashMap(this.params.getters.players());
    const impactedPlayers = new Map<IPlayer["id"], UpdateStruct>();
    for (const { playerId, time, type } of this.params.getters.occurances()) {
      if (!impactedPlayers.get(playerId)) {
        impactedPlayers.set(playerId, {
          playerId: playerId,
        });
      }
      const obj = impactedPlayers.get(playerId)!;
      switch (type) {
        case "REDCARD": {
          const suspensionTime = this.params.calculators.suspensionPeriod.calculate(
            this.playersHashMap[playerId],
            time,
          );
          impactedPlayers.set(playerId, {
            ...obj,
            suspensionPeriod: suspensionTime,
          });
          break;
        }
        case "INJURY": {
          const injuryTime = this.params.calculators.injuryPeriod.calculate(
            this.playersHashMap[playerId],
            time,
          );
          impactedPlayers.set(playerId, {
            ...obj,
            injuryPeriod: injuryTime,
          });
          break;
        }
        case "GOAL_REGULAR":
        case "PENALTI_SCORED": {
          impactedPlayers.set(playerId, {
            ...obj,
            goals: obj.goals ? obj.goals + 1 : 1,
          });
          break;
        }
      }
    }
    return impactedPlayers;
  }

  private async updatePlayers(playersUpdates: Map<IPlayer["id"], UpdateStruct>) {
    const promises: Promise<IPlayer["id"]>[] = [];
    const playedTimes = this.params.getters.playedTimeByPlayersIds();
    for (const player of Object.values(this.playersHashMap)) {
      const playerUpdates = playersUpdates.get(player.id) ?? { playerId: player.id };
      const patchObj: PatchObject<IPlayer> = {
        id: playerUpdates.playerId,
        stats: {
          seasonGoals: player.stats.seasonGoals + (playerUpdates.goals ?? 0),
          games: player.stats.games + 1,
          goals: player.stats.goals + (playerUpdates.goals ?? 0),
          injuries: playerUpdates.injuryPeriod ? player.stats.injuries + 1 : player.stats.injuries,
          redcards: playerUpdates.suspensionPeriod
            ? player.stats.redcards + 1
            : player.stats.redcards,
        },
      };
      if (playerUpdates.suspensionPeriod) {
        patchObj.suspensionPeriod = playerUpdates.suspensionPeriod;
      }
      if (playerUpdates.injuryPeriod) {
        patchObj.injuryPeriod = playerUpdates.injuryPeriod;
      }
      const playedTime = playedTimes[player.id];
      patchObj.power = this.params.calculators.playerPowerChange.calculate(
        player,
        playedTime,
        patchObj.injuryPeriod,
      );
      promises.push(Player.patch(patchObj));
    }
    await Promise.all(promises);
  }

  private async updateTeamsFinances() {
    const { awayId, homeId } = this.params.getters.fixture();

    await TeamBudget.creditAttendeesMoney(
      homeId,
      this.params.getters.attendees(),
      this.params.homeTeamTicketMoneyShare,
    );

    await TeamBudget.debitPlayersSalaries(awayId);
    await TeamBudget.debitPlayersSalaries(homeId);
  }

  private async updateFixtureEntity() {
    const [homeGoals, awayGoals] = this.params.getters.finalScoreline();
    const fixture = await Fixture.getById(this.params.getters.fixture().id);
    const attendees = this.params.getters.attendees();
    fixture.homeGoals = homeGoals;
    fixture.awayGoals = awayGoals;
    fixture.attendees = attendees;
    fixture.occurred = true;
    await Fixture.update(fixture);
  }

  private async updateTeamsMorales() {
    const [homeGoals, awayGoals] = this.params.getters.finalScoreline();
    const { awayId, homeId } = this.params.getters.fixture();
    const [homeMorale, awayMorale] = this.params.getters.morales();
    const homeStatus = homeGoals > awayGoals ? "win" : homeGoals < awayGoals ? "loss" : "draw";
    const awayStatus = awayGoals > homeGoals ? "win" : awayGoals < homeGoals ? "loss" : "draw";

    const { moraleBoostWin, moraleBoostDraw, moraleBoostLoss, minMorale, maxMorale } = this.params;

    switch (homeStatus) {
      case "win": {
        await Team.patch({
          id: homeId,
          morale: clamp(homeMorale + moraleBoostWin, minMorale, maxMorale),
        });
        break;
      }
      case "loss": {
        await Team.patch({
          id: homeId,
          morale: clamp(homeMorale + moraleBoostLoss, minMorale, maxMorale),
        });
        break;
      }
      case "draw": {
        await Team.patch({
          id: homeId,
          morale: clamp(homeMorale + moraleBoostDraw, minMorale, maxMorale),
        });
        break;
      }
      default: {
        console.error({ homeStatus, awayStatus, homeId, awayId });
      }
    }

    switch (awayStatus) {
      case "win": {
        await Team.patch({
          id: awayId,
          morale: clamp(awayMorale + moraleBoostWin, minMorale, maxMorale),
        });
        break;
      }
      case "loss": {
        await Team.patch({
          id: awayId,
          morale: clamp(awayMorale + moraleBoostLoss, minMorale, maxMorale),
        });
        break;
      }
      case "draw": {
        await Team.patch({
          id: awayId,
          morale: clamp(awayMorale + moraleBoostDraw, minMorale, maxMorale),
        });
        break;
      }
      default: {
        console.error({ homeStatus, awayStatus, homeId, awayId });
      }
    }
  }

  async process() {
    const playersUpdates = await this.preProcessFixtureOccurances();
    await this.updatePlayers(playersUpdates);
    await this.updateTeamsFinances();
    await this.updateFixtureEntity();
    await this.updateTeamsMorales();
  }
}
