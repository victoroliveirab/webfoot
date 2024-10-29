import { Fixture, Player, SimulationRecord, Standing, Team, TeamBudget } from "@webfoot/models";
import type {
  IChampionship,
  IFixture,
  IPlayer,
  ISimulationRecord,
  IStanding,
} from "@webfoot/core/models/types";
import { arrayToHashMap } from "@webfoot/utils/array";
import { clamp } from "@webfoot/utils/math";
import type { HashMap, PatchObject } from "@webfoot/utils/types";

import {
  MORALE_BOOST_DRAW,
  MORALE_BOOST_LOST,
  MORALE_BOOST_WIN,
  MORALE_MAX,
  MORALE_MIN,
} from "./constants";
import calculateInjuredTime from "../calculators/injured-time";
import { calculatePlayerPlayedTime } from "../calculators/player-played-time";
import { calculatePlayerPowerChangePostFixture } from "../calculators/player-power-change";
import calculateSuspensionTime from "../calculators/suspension-time";
import type Simulator from "../simulator";
import { getAllPlayersOnSimulator } from "../simulator/helpers";

type UpdateStruct = {
  playerId: IPlayer["id"];
  goals?: number;
  injuryPeriod?: number;
  suspensionPeriod?: number;
};

export default class PostRoundProcessor {
  protected players!: HashMap<IPlayer>;
  protected processedFixtures: HashMap<IFixture> = [];
  protected processedSimulations: ISimulationRecord["id"][] = [];

  constructor(private readonly simulations: Simulator[]) {}

  private async prepare() {
    const allPlayers = await Player.getAll();
    this.players = arrayToHashMap(allPlayers);
  }

  private async decreaseUnavailablePeriods() {
    const promises: unknown[] = [];
    for (const player of Object.values(this.players)) {
      let patchObj: Partial<IPlayer> | undefined;
      if (player.suspensionPeriod > 0) {
        patchObj = {
          suspensionPeriod: player.suspensionPeriod - 1,
        };
      }
      if (player.injuryPeriod > 0) {
        if (!patchObj) patchObj = {};
        patchObj.injuryPeriod = player.injuryPeriod - 1;
      }
      if (patchObj) {
        this.players[player.id].suspensionPeriod = patchObj.suspensionPeriod ?? 0;
        this.players[player.id].injuryPeriod = patchObj.injuryPeriod ?? 0;
        promises.push(Player.update(this.players[player.id]));
      }
    }
    await Promise.all(promises);
  }

  private preProcessFixtureOccurances(simulation: Simulator) {
    const { occurances } = simulation;
    const impactedPlayers = new Map<IPlayer["id"], UpdateStruct>();
    for (const { playerId, time, type } of occurances) {
      if (!impactedPlayers.get(playerId)) {
        impactedPlayers.set(playerId, {
          playerId: playerId,
        });
      }
      const obj = impactedPlayers.get(playerId)!;
      switch (type) {
        case "REDCARD": {
          const suspensionTime = calculateSuspensionTime(this.players[playerId], time);
          impactedPlayers.set(playerId, {
            ...obj,
            suspensionPeriod: suspensionTime,
          });
          break;
        }
        case "INJURY": {
          const injuryTime = calculateInjuredTime(this.players[playerId]);
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

  private async updatePlayers(
    simulation: Simulator,
    playersUpdates: Map<IPlayer["id"], UpdateStruct>,
  ) {
    const players = getAllPlayersOnSimulator(simulation);
    const promises: Promise<IPlayer["id"]>[] = [];
    for (const player of players) {
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
      const playedTime = calculatePlayerPlayedTime(simulation, player);
      patchObj.power = calculatePlayerPowerChangePostFixture(
        player,
        playedTime,
        patchObj.injuryPeriod,
      );
      promises.push(Player.patch(patchObj));
    }
    await Promise.all(promises);
  }

  private async updateTeamsFinances(simulation: Simulator) {
    const { awayId, homeId } = simulation.fixture;
    await TeamBudget.creditAttendeesMoney(homeId, simulation.attendees);

    await TeamBudget.debitPlayersSalaries(awayId);
    await TeamBudget.debitPlayersSalaries(homeId);
  }

  private async updateFixtureEntity(simulation: Simulator) {
    const [homeGoals, awayGoals] = simulation.currentScoreline;
    const { attendees } = simulation;
    const fixture = await Fixture.getById(simulation.fixture.id);
    fixture.homeGoals = homeGoals;
    fixture.awayGoals = awayGoals;
    fixture.attendees = attendees;
    fixture.occurred = true;
    await Fixture.update(fixture);
    this.processedFixtures[fixture.id] = fixture;
  }

  private async updateTeamsMorale(simulation: Simulator) {
    const [homeGoals, awayGoals] = simulation.currentScoreline;
    const homeWon = homeGoals > awayGoals;
    const homeLost = homeGoals < awayGoals;
    const awayWon = awayGoals > homeGoals;
    const awayLost = awayGoals < homeGoals;

    if (homeWon) {
      await Team.patch({
        id: simulation.fixture.homeId,
        morale: clamp(simulation.homeMorale + MORALE_BOOST_WIN, MORALE_MIN, MORALE_MAX),
      });
    } else if (homeLost) {
      await Team.patch({
        id: simulation.fixture.homeId,
        morale: clamp(simulation.homeMorale + MORALE_BOOST_LOST, MORALE_MIN, MORALE_MAX),
      });
    } else {
      await Team.patch({
        id: simulation.fixture.homeId,
        morale: clamp(simulation.homeMorale + MORALE_BOOST_DRAW, MORALE_MIN, MORALE_MAX),
      });
    }

    if (awayWon) {
      await Team.patch({
        id: simulation.fixture.awayId,
        morale: clamp(simulation.awayMorale + MORALE_BOOST_WIN, MORALE_MIN, MORALE_MAX),
      });
    } else if (awayLost) {
      await Team.patch({
        id: simulation.fixture.awayId,
        morale: clamp(simulation.awayMorale + MORALE_BOOST_LOST, MORALE_MIN, MORALE_MAX),
      });
    } else {
      await Team.patch({
        id: simulation.fixture.awayId,
        morale: clamp(simulation.awayMorale + MORALE_BOOST_DRAW, MORALE_MIN, MORALE_MAX),
      });
    }
  }

  private async updateStandings() {
    const standingsByChampionship = new Map<IChampionship["id"], IStanding[]>();
    for (const fixture of Object.values(this.processedFixtures)) {
      const { awayGoals, awayId, championshipId, homeGoals, homeId } = fixture;
      if (!standingsByChampionship.get(championshipId)) {
        const standings = await Standing.getMultipleByIndex("championshipId", championshipId);
        standingsByChampionship.set(championshipId, standings);
      }

      const standings = standingsByChampionship.get(championshipId)!;
      const homeStanding = standings.find(({ teamId }) => teamId === homeId)!;
      const awayStanding = standings.find(({ teamId }) => teamId === awayId)!;

      const homePoints = homeGoals > awayGoals ? 3 : homeGoals < awayGoals ? 0 : 1;
      const awayPoints = awayGoals > homeGoals ? 3 : awayGoals < homeGoals ? 0 : 1;

      homeStanding.points = homeStanding.points + homePoints;
      homeStanding.goalsPro = homeStanding.goalsPro + homeGoals;
      homeStanding.goalsAgainst = homeStanding.goalsAgainst + awayGoals;
      awayStanding.points = awayStanding.points + awayPoints;
      awayStanding.goalsPro = awayStanding.goalsPro + awayGoals;
      awayStanding.goalsAgainst = awayStanding.goalsAgainst + homeGoals;

      switch (homePoints) {
        case 3: {
          homeStanding.wins = homeStanding.wins + 1;
          break;
        }
        case 1: {
          homeStanding.draws = homeStanding.draws + 1;
          break;
        }
        case 0: {
          homeStanding.losses = homeStanding.losses + 1;
          break;
        }
        default: {
          console.error(homeStanding);
        }
      }

      switch (awayPoints) {
        case 3: {
          awayStanding.wins = awayStanding.wins + 1;
          break;
        }
        case 1: {
          awayStanding.draws = awayStanding.draws + 1;
          break;
        }
        case 0: {
          awayStanding.losses = awayStanding.losses + 1;
          break;
        }
        default: {
          console.error(awayStanding);
        }
      }

      await Standing.update(homeStanding);
      await Standing.update(awayStanding);
    }
  }

  async process() {
    await this.prepare();
    await this.decreaseUnavailablePeriods();
    for (const simulation of this.simulations) {
      const playersUpdates = this.preProcessFixtureOccurances(simulation);
      await this.updatePlayers(simulation, playersUpdates);
      await this.updateTeamsFinances(simulation);
      await this.updateFixtureEntity(simulation);
      this.processedSimulations.push(
        await SimulationRecord.add({
          fixtureId: simulation.fixture.id,
          story: simulation.occurances,
        }),
      );
    }
    await this.updateStandings();
  }

  get result() {
    return this.processedSimulations;
  }
}
