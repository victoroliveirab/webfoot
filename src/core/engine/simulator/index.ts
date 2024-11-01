import type { Story } from "@webfoot/core/db/types";
import Logger from "@webfoot/core/logger";
import { Fixture, Player, Team, TeamBudget } from "@webfoot/core/models";
import type { IFixture, IPlayer, ITeam } from "@webfoot/core/models/types";
import { arrayToHashMap, pickRandom } from "@webfoot/utils/array";
import { randomWeighted } from "@webfoot/utils/math";
import type { PatchObject } from "@webfoot/utils/types";

import {
  getCurrentScorelineOfSimulator,
  getFixtureOfSimulator,
  getSquadOfSimulator,
  getSubsLeftOfSimulator,
} from "./getters";
import type {
  IGoalScoredCalculator,
  IInjuryCalculator,
  IInjuryStoryProcessor,
  IMoraleChangeProcessor,
  IPlayerPowerChangePostFixtureProcessor,
  IRedCardCalculator,
  IRedCardStoryProcessor,
  ITeamStrengthCalculator,
} from "../interfaces";
import { AITrainerStrategy, SquadRecord } from "../types";
import aiTrainerFactory from "../ai/trainer";
import type AITrainer from "../ai/trainer/base";
import { getIsPlayerEligibleToPlay } from "../helpers/player";

type SimulatorAITeam = {
  aiStrategy: AITrainerStrategy;
  morale: number;
  players: IPlayer[];
};

type SimulatorHumanTeam = {
  morale: number;
  squad: SquadRecord;
};

export type SimulatorTeam = SimulatorAITeam | SimulatorHumanTeam;

type SimulatorConstructorParams = {
  awayTeam: SimulatorTeam;
  fixture: IFixture;
  homeTeam: SimulatorTeam;
  stadiumCapacity: number;
  calculators: {
    goalScoredCalculator: IGoalScoredCalculator;
    injuryCalculator: IInjuryCalculator;
    redcardCalculator: IRedCardCalculator;
    teamStrengthCalculator: ITeamStrengthCalculator;
  };
  processors: {
    awayTeamMoraleChangeProcessor: IMoraleChangeProcessor;
    homeTeamMoraleChangeProcessor: IMoraleChangeProcessor;
    injuryStoryProcessor: IInjuryStoryProcessor;
    playerPowerChangeProcessor: IPlayerPowerChangePostFixtureProcessor;
    redCardStoryProcessor: IRedCardStoryProcessor;
  };
};

type TickUpdates = {
  newScoreLine: [number, number];
  newStories: Story[];
};

function getIsAI(params: SimulatorTeam): params is SimulatorAITeam {
  return "aiStrategy" in params;
}

class Simulator {
  fixture: IFixture;
  protected homeSquadRecord: SquadRecord;
  protected awaySquadRecord: SquadRecord;
  protected homeUnusedPlayers: IPlayer[];
  protected awayUnusedPlayers: IPlayer[];
  readonly homeMorale: number;
  readonly awayMorale: number;
  protected clock: number = 0;
  readonly calculators: SimulatorConstructorParams["calculators"];
  readonly processors: SimulatorConstructorParams["processors"];
  protected readonly homeAITrainer: AITrainer | null = null;
  protected readonly awayAITrainer: AITrainer | null = null;
  homeSubsLeft: number = 3;
  awaySubsLeft: number = 3;
  // This will end up with 91 values (0-90 min) which is fine
  scoreline: [number, number][] = [[0, 0]];
  attendees: number;
  protected story: Story[] = [];

  constructor(params: SimulatorConstructorParams) {
    this.fixture = params.fixture;

    if (getIsAI(params.homeTeam)) {
      const { aiStrategy, players } = params.homeTeam;
      const homeAITrainer = aiTrainerFactory(aiStrategy, {
        getters: {
          currentScoreline: getCurrentScorelineOfSimulator.bind(this),
          fixture: getFixtureOfSimulator.bind(this),
          isHomeTeam: () => true,
          squad: getSquadOfSimulator("home").bind(this),
          subsLeft: getSubsLeftOfSimulator("home").bind(this),
        },
        teamId: this.fixture.homeId,
      });
      const homeSquad = homeAITrainer.pickFixtureSquad(players.filter(getIsPlayerEligibleToPlay));
      const homeSelectedPlayersIds = [
        ...homeSquad.playing.map(({ id }) => id),
        ...homeSquad.bench.map(({ id }) => id),
      ];
      this.homeUnusedPlayers = players.filter(({ id }) => !homeSelectedPlayersIds.includes(id));
      this.homeSquadRecord = {
        ...homeSquad,
        out: [],
      };
      this.homeAITrainer = homeAITrainer;
    } else {
      const { out, ...squad } = params.homeTeam.squad;
      this.homeUnusedPlayers = out;
      this.homeSquadRecord = {
        ...squad,
        out: [],
      };
    }

    if (getIsAI(params.awayTeam)) {
      const { aiStrategy, players } = params.awayTeam;
      const awayAITrainer = aiTrainerFactory(aiStrategy, {
        getters: {
          currentScoreline: getCurrentScorelineOfSimulator.bind(this),
          fixture: getFixtureOfSimulator.bind(this),
          isHomeTeam: () => false,
          squad: getSquadOfSimulator("away").bind(this),
          subsLeft: getSubsLeftOfSimulator("away").bind(this),
        },
        teamId: this.fixture.awayId,
      });
      const awaySquad = awayAITrainer.pickFixtureSquad(players.filter(getIsPlayerEligibleToPlay));
      const awaySelectedPlayersIds = [
        ...awaySquad.playing.map(({ id }) => id),
        ...awaySquad.bench.map(({ id }) => id),
      ];
      this.awayUnusedPlayers = players.filter(({ id }) => !awaySelectedPlayersIds.includes(id));
      this.awaySquadRecord = {
        ...awaySquad,
        out: [],
      };
      this.awayAITrainer = awayAITrainer;
    } else {
      const { out, ...squad } = params.awayTeam.squad;
      this.awayUnusedPlayers = out;
      this.awaySquadRecord = {
        ...squad,
        out: [],
      };
    }

    this.homeMorale = params.homeTeam.morale;
    this.awayMorale = params.awayTeam.morale;
    this.calculators = params.calculators;

    this.attendees = randomWeighted(1_000, params.stadiumCapacity, this.homeMorale);

    this.processors = params.processors;
  }

  private getSquadByTeamId(teamId: ITeam["id"]) {
    if (teamId === this.fixture.homeId) return this.homeSquadRecord;
    if (teamId === this.fixture.awayId) return this.awaySquadRecord;
    throw new Error(`Team ${teamId} is not part of fixture ${this.fixture.id}`);
  }

  private getIsTeamHomeByTeamId(teamId: ITeam["id"]) {
    if (teamId === this.fixture.homeId) return true;
    if (teamId === this.fixture.awayId) return false;
    throw new Error(`Team ${teamId} is not part of fixture ${this.fixture.id}`);
  }

  private calculateGoals(updateArr: TickUpdates) {
    let homeGoals = updateArr.newScoreLine[0];
    let awayGoals = updateArr.newScoreLine[1];
    const homePlayingSquad = this.homeSquadRecord.playing;
    const awayPlayingSquad = this.awaySquadRecord.playing;

    // OPTIMIZE: cache this number and only recalculate on sub/injury/redcard
    const homeTeamStrength = this.calculators.teamStrengthCalculator.calculate(
      homePlayingSquad,
      this.homeMorale,
    );
    const awayTeamStrength = this.calculators.teamStrengthCalculator.calculate(
      awayPlayingSquad,
      this.awayMorale,
    );
    const homeScoreValue = this.calculators.goalScoredCalculator.calculate(
      homePlayingSquad,
      homeTeamStrength.attack,
      awayTeamStrength.defense,
    );
    const awayScoreValue = this.calculators.goalScoredCalculator.calculate(
      awayPlayingSquad,
      awayTeamStrength.attack,
      homeTeamStrength.defense,
    );

    if (homeScoreValue.goal) {
      homeGoals++;
      updateArr.newStories.push({
        type: "GOAL_REGULAR",
        playerId: homeScoreValue.scorer.id,
        time: this.clock,
      });
      // The else if is intentional to slightly favor home teams
    } else if (awayScoreValue.goal) {
      awayGoals++;
      updateArr.newStories.push({
        type: "GOAL_REGULAR",
        playerId: awayScoreValue.scorer.id,
        time: this.clock,
      });
    }
    updateArr.newScoreLine = [homeGoals, awayGoals];
  }

  private substituteIAInjuredPlayer(
    trainer: AITrainer,
    injuredPlayer: IPlayer,
    updateArr: TickUpdates,
  ) {
    const { teamId } = trainer;
    const { bench } = this.getSquadByTeamId(teamId);
    const hasSubPlayersAvailable = bench.length > 0;
    const isHomeTeam = this.getIsTeamHomeByTeamId(teamId);
    const subsLeft = isHomeTeam ? this.homeSubsLeft : this.awaySubsLeft;
    const hasSubsLeft = subsLeft > 0;
    if (!hasSubPlayersAvailable || !hasSubsLeft) {
      this.removePlayingPlayer(teamId, injuredPlayer.id);
      return;
    }

    const sub = trainer.decideSubstitutionPostInjury(injuredPlayer);
    if (sub) {
      this.substitutePlayers(teamId, injuredPlayer.id, sub.id, updateArr);
    } else {
      this.removePlayingPlayer(teamId, injuredPlayer.id);
    }
  }

  private substituteIAAfterRedCard(
    trainer: AITrainer,
    sentOffPlayer: IPlayer,
    updateArr: TickUpdates,
  ) {
    const { teamId } = trainer;
    const { bench } = this.getSquadByTeamId(teamId);
    const hasSubPlayersAvailable = bench.length > 0;
    const isHomeTeam = this.getIsTeamHomeByTeamId(teamId);
    const hasSubsLeft = isHomeTeam ? this.homeSubsLeft > 0 : this.awaySubsLeft > 0;
    if (!hasSubPlayersAvailable || !hasSubsLeft) {
      this.removePlayingPlayer(teamId, sentOffPlayer.id);
      return;
    }

    const sub = trainer.decideSubstitutionPostRedcard(sentOffPlayer);
    this.removePlayingPlayer(teamId, sentOffPlayer.id);
    if (sub) {
      this.substitutePlayers(teamId, sub.playerOut.id, sub.playerIn.id, updateArr);
    }
  }

  private calculateInjuries(updateArr: TickUpdates) {
    const homePlayersInjuryCandidates = this.homeSquadRecord.playing
      .map((player) => this.calculators.injuryCalculator.calculate(player))
      .map((injuried, i) => (injuried ? i : -1))
      .filter((el) => el >= 0);
    const awayPlayersInjuryCandidates = this.awaySquadRecord.playing
      .map((player) => this.calculators.injuryCalculator.calculate(player))
      .map((injuried, i) => (injuried ? i : -1))
      .filter((el) => el >= 0);
    if (homePlayersInjuryCandidates.length > 0) {
      const injuriedPlayer = this.homeSquadRecord.playing[pickRandom(homePlayersInjuryCandidates)];
      updateArr.newStories.push({
        playerId: injuriedPlayer.id,
        time: this.clock,
        type: "INJURY",
      });
      this.homeSquadRecord.out.push(injuriedPlayer);
      if (this.homeAITrainer) {
        // Home team is not human controlled, so let's do the substitution automatically
        this.substituteIAInjuredPlayer(this.homeAITrainer, injuriedPlayer, updateArr);
      }
    }
    if (awayPlayersInjuryCandidates.length > 0) {
      const injuriedPlayer = this.awaySquadRecord.playing[pickRandom(awayPlayersInjuryCandidates)];
      updateArr.newStories.push({
        playerId: injuriedPlayer.id,
        time: this.clock,
        type: "INJURY",
      });
      if (this.awayAITrainer) {
        // Away team is not human controlled, so let's do the substitution automatically
        this.substituteIAInjuredPlayer(this.awayAITrainer, injuriedPlayer, updateArr);
      }
    }
  }

  private calculateRedCards(updateArr: TickUpdates) {
    const newInjuriedPlayers = updateArr.newStories
      .filter(({ type }) => type === "INJURY")
      .map(({ playerId }) => playerId);

    const homeTeamHasInjuriedPlayer = this.homeSquadRecord.out.some(({ id }) =>
      newInjuriedPlayers.includes(id),
    );

    // If team has injuried player, let's not send off any player!
    if (!homeTeamHasInjuriedPlayer) {
      const homePlayersSentOffCandidates = this.homeSquadRecord.playing
        .map((player) => this.calculators.redcardCalculator.calculate(player))
        .map((sentOff, i) => (sentOff ? i : -1))
        .filter((el) => el >= 0);
      if (homePlayersSentOffCandidates.length > 0) {
        const sentOffPlayer =
          this.homeSquadRecord.playing[pickRandom(homePlayersSentOffCandidates)];
        updateArr.newStories.push({
          playerId: sentOffPlayer.id,
          time: this.clock,
          type: "REDCARD",
        });
        if (this.homeAITrainer) {
          this.substituteIAAfterRedCard(this.homeAITrainer, sentOffPlayer, updateArr);
        } else {
          this.removePlayingPlayer(this.fixture.homeId, sentOffPlayer.id);
        }
      }
    }

    const awayTeamHasInjuriedPlayer = this.awaySquadRecord.out.some(({ id }) =>
      newInjuriedPlayers.includes(id),
    );
    if (!awayTeamHasInjuriedPlayer) {
      const awayPlayersSentOffCandidates = this.awaySquadRecord.playing
        .map((player) => this.calculators.redcardCalculator.calculate(player))
        .map((sentOff, i) => (sentOff ? i : -1))
        .filter((el) => el >= 0);
      if (awayPlayersSentOffCandidates.length > 0) {
        const sentOffPlayer =
          this.awaySquadRecord.playing[pickRandom(awayPlayersSentOffCandidates)];
        updateArr.newStories.push({
          playerId: sentOffPlayer.id,
          time: this.clock,
          type: "REDCARD",
        });
        if (this.awayAITrainer) {
          this.substituteIAAfterRedCard(this.awayAITrainer, sentOffPlayer, updateArr);
        } else {
          this.removePlayingPlayer(this.fixture.awayId, sentOffPlayer.id);
        }
      }
    }
  }

  tick(): TickUpdates {
    const updates: TickUpdates = {
      newScoreLine: [this.scoreline[this.clock][0], this.scoreline[this.clock][1]],
      newStories: [],
    };
    this.clock++;

    this.calculateGoals(updates);
    this.calculateInjuries(updates);
    this.calculateRedCards(updates);

    this.scoreline.push(updates.newScoreLine);
    if (updates.newStories.length > 0) {
      for (const newStory of updates.newStories) {
        this.story.push(newStory);
      }
    }

    return updates;
  }

  get currentScoreline() {
    return this.scoreline[this.scoreline.length - 1];
  }

  get lastOccurance() {
    if (this.story.length === 0) return;
    for (let index = this.story.length - 1; index >= 0; --index) {
      if (
        this.story[index].type !== "SUBSTITUTION" &&
        this.story[index].type !== "PENALTI_MISSED"
      ) {
        return this.story[index];
      }
    }
  }

  get occurances() {
    return this.story;
  }

  get squads() {
    return {
      away: this.awaySquadRecord,
      home: this.homeSquadRecord,
    };
  }

  get playedTime() {
    return this.clock;
  }

  get players() {
    return [
      ...this.squads.home.playing,
      ...this.squads.home.bench,
      ...this.squads.home.out,
      ...this.squads.away.playing,
      ...this.squads.away.bench,
      ...this.squads.away.out,
    ];
  }

  get isHomeTeamAITrained() {
    return !!this.homeAITrainer;
  }
  get isAwayTeamAITrained() {
    return !!this.awayAITrainer;
  }

  getPlayer(playerId: IPlayer["id"]) {
    // Just to avoid creating unnecessary copies
    for (const player of this.homeSquadRecord.playing) {
      if (player.id === playerId) return player;
    }
    for (const player of this.awaySquadRecord.playing) {
      if (player.id === playerId) return player;
    }
    for (const player of this.homeSquadRecord.out) {
      if (player.id === playerId) return player;
    }
    for (const player of this.awaySquadRecord.out) {
      if (player.id === playerId) return player;
    }
    for (const player of this.homeSquadRecord.bench) {
      if (player.id === playerId) return player;
    }
    for (const player of this.awaySquadRecord.bench) {
      if (player.id === playerId) return player;
    }
  }

  getPlayerPlayedTime(player: IPlayer) {
    const playerId = player.id;
    const teamKey = player.teamId === this.fixture.homeId ? "homeSquadRecord" : "awaySquadRecord";

    const { bench, playing } = this[teamKey];

    // Player started on the bench and has not left bench
    if (bench.find(({ id }) => id === playerId)) return 0;

    if (playing.find(({ id }) => id === playerId)) {
      // Player either:
      // 1. Started the match playing and hasn't left
      // 2. Came out of the bench and hasn't left
      const cameInTime =
        this.occurances.find(
          ({ type, playerId: playerInId }) => type === "SUBSTITUTION" && playerId === playerInId,
        )?.time ?? 0;
      return this.clock - cameInTime;
    }

    // Player either:
    // 1. Started the match but got subbed along the way
    // 2. Came out the bench and got subbed (poor guy)
    let cameInTime = 0;
    for (const occurance of this.occurances) {
      if (occurance.type !== "SUBSTITUTION") continue;
      const { playerId: playerInId, subbedPlayerId, time } = occurance;
      if (playerInId === playerId) {
        cameInTime = time;
      } else if (subbedPlayerId === player.id) {
        return time - cameInTime;
      }
    }

    // Player either:
    // 1. Started the match but got sent off along the way
    // 2. Came out the bench and got sent off along the way
    for (const occurance of this.occurances) {
      if (occurance.type !== "REDCARD") continue;
      const { playerId: sentOffPlayerId, time } = occurance;
      if (sentOffPlayerId === playerId) {
        return time - cameInTime;
      }
    }

    // Player either:
    // 1. Started the match, got injured, but no player subbed him
    // 2. Came out the bench, got injured, but no player subbed him
    for (const occurance of this.occurances) {
      if (occurance.type !== "INJURY") continue;
      const { playerId: injuredPlayerId, time } = occurance;
      if (injuredPlayerId === playerId) {
        return time - cameInTime;
      }
    }

    console.error({ simulation: this, player });
    throw new Error("This should be unreached");
  }

  substitutePlayers(
    teamId: ITeam["id"],
    playerOut: IPlayer["id"],
    playerIn: IPlayer["id"],
    updateArr?: TickUpdates,
  ) {
    const squadRecord =
      teamId === this.fixture.homeId ? this.homeSquadRecord : this.awaySquadRecord;
    const leavingPlayer = squadRecord.playing.findIndex((player) => player.id === playerOut);
    const joiningPlayer = squadRecord.bench.findIndex((player) => player.id === playerIn);
    if (leavingPlayer < 0 || joiningPlayer < 0)
      throw new Error("Cannot switch players that don't belong to team");
    const outPlayer = squadRecord.playing[leavingPlayer];
    const inPlayer = squadRecord.bench[joiningPlayer];
    squadRecord.playing.splice(leavingPlayer, 1, squadRecord.bench[joiningPlayer]);
    squadRecord.bench.splice(joiningPlayer, 1);
    squadRecord.out.push(outPlayer);
    if (teamId === this.fixture.homeId) {
      this.homeSubsLeft--;
    } else {
      this.awaySubsLeft--;
    }

    if (updateArr) {
      updateArr.newStories.push({
        playerId: inPlayer.id,
        subbedPlayerId: outPlayer.id,
        time: this.clock,
        type: "SUBSTITUTION",
      });
    } else {
      this.story.push({
        playerId: inPlayer.id,
        subbedPlayerId: outPlayer.id,
        time: this.clock,
        type: "SUBSTITUTION",
      });
    }
  }

  removePlayingPlayer(teamId: ITeam["id"], playerOut: IPlayer["id"]) {
    const squadRecord =
      teamId === this.fixture.homeId ? this.homeSquadRecord : this.awaySquadRecord;
    const leavingPlayerIndex = squadRecord.playing.findIndex((player) => player.id === playerOut);
    if (leavingPlayerIndex < 0) throw new Error("Cannot remove player that don't belong to team");
    const leavingPlayer = squadRecord.playing[leavingPlayerIndex];
    squadRecord.playing.splice(leavingPlayerIndex, 1);
    squadRecord.out.push(leavingPlayer);
  }

  protected async postFixtureProcessNonSelectedPlayers() {
    let patchObj: PatchObject<IPlayer> = { id: 0 };
    for (const player of [...this.homeUnusedPlayers, ...this.awayUnusedPlayers]) {
      if (player.injuryPeriod > 0) {
        patchObj.id = player.id;
        patchObj.injuryPeriod = player.injuryPeriod - 1;
      }
      if (player.suspensionPeriod > 0) {
        patchObj.id = player.id;
        patchObj.suspensionPeriod = player.suspensionPeriod - 1;
      }
      const newPower = this.processors.playerPowerChangeProcessor.calculateNewPower(player, 0);
      if (newPower !== player.power) {
        patchObj.id = player.id;
        patchObj.power = newPower;
      }
      // Something in the player changed
      if (patchObj.id > 0) {
        await Player.patch(patchObj);
        patchObj.id = 0;
      }
    }
  }

  protected async postFixturePreProcessFixtureOccurances() {
    const selectedPlayers = arrayToHashMap(this.players);
    const impactedPlayers = new Map<IPlayer["id"], PatchObject<IPlayer>>();
    for (const story of this.occurances) {
      const { playerId, time, type } = story;
      if (!impactedPlayers.get(playerId)) {
        impactedPlayers.set(playerId, { id: playerId });
      }
      const obj = impactedPlayers.get(playerId)!;
      await Logger.logSimulationStory(this, selectedPlayers[playerId], story);
      switch (type) {
        case "REDCARD": {
          const suspensionPeriod = this.processors.redCardStoryProcessor.calculateSuspensionPeriod(
            selectedPlayers[playerId],
            time,
          );
          impactedPlayers.set(playerId, {
            ...obj,
            suspensionPeriod,
          });
          break;
        }
        case "INJURY": {
          const injuryPeriod = this.processors.injuryStoryProcessor.calculateInjuryPeriod(
            selectedPlayers[playerId],
            time,
          );
          impactedPlayers.set(playerId, {
            ...obj,
            injuryPeriod,
          });
          break;
        }
        case "GOAL_REGULAR":
        case "PENALTI_SCORED": {
          const currentStats = obj.stats ?? selectedPlayers[playerId].stats;
          impactedPlayers.set(playerId, {
            ...obj,
            stats: {
              ...currentStats,
              goals: currentStats.goals + 1,
              seasonGoals: currentStats.seasonGoals + 1,
            },
          });
          break;
        }
      }
    }
    return impactedPlayers;
  }

  protected async postFixtureProcessInvolvedPlayers(
    playersUpdates: Map<IPlayer["id"], PatchObject<IPlayer>>,
  ) {
    for (const player of this.players) {
      const playerUpdates = playersUpdates.get(player.id);
      const newSeasonGoals = playerUpdates?.stats?.seasonGoals ?? player.stats.seasonGoals;
      const newGoals = playerUpdates?.stats?.goals ?? player.stats.goals;
      const newGames = player.stats.games + 1;
      const newInjuries = playerUpdates?.injuryPeriod
        ? player.stats.injuries + 1
        : player.stats.injuries;
      const newRedCards = playerUpdates?.suspensionPeriod
        ? player.stats.redcards + 1
        : player.stats.redcards;
      const newSuspensionPeriod = playerUpdates?.suspensionPeriod ?? 0;
      const newInjuryPeriod = playerUpdates?.injuryPeriod ?? 0;
      const playedTime = this.getPlayerPlayedTime(player);
      const newPower = this.processors.playerPowerChangeProcessor.calculateNewPower(
        player,
        playedTime,
        newInjuryPeriod,
      );
      await Player.patch({
        id: player.id,
        stats: {
          seasonGoals: newSeasonGoals,
          goals: newGoals,
          games: newGames,
          injuries: newInjuries,
          redcards: newRedCards,
        },
        injuryPeriod: newInjuryPeriod,
        suspensionPeriod: newSuspensionPeriod,
        power: newPower,
      });
    }
  }

  protected async postFixtureProcessTeamsFinances() {
    const { awayId, homeId } = this.fixture;
    // TODO: make this come from a processor

    await TeamBudget.creditAttendeesMoney(homeId, this.attendees);
    await TeamBudget.debitPlayersSalaries(awayId);
    await TeamBudget.debitPlayersSalaries(homeId);
  }

  protected async postFixtureProcessFixtureEntity() {
    const [homeGoals, awayGoals] = this.currentScoreline;
    await Fixture.patch({
      id: this.fixture.id,
      homeGoals,
      awayGoals,
      attendees: this.attendees,
      occurred: true,
    });
  }

  protected async postFixtureProcessTeamsMorales() {
    const { awayId, homeId } = this.fixture;
    const [homeGoals, awayGoals] = this.currentScoreline;
    const homeResult = homeGoals > awayGoals ? "W" : homeGoals < awayGoals ? "L" : "D";
    const newHomeMorale = this.processors.homeTeamMoraleChangeProcessor.calculateNewMorale(
      this.homeMorale,
      homeResult,
    );
    const awayResult = awayGoals > homeGoals ? "W" : awayGoals < homeGoals ? "L" : "D";
    const newAwayMorale = this.processors.awayTeamMoraleChangeProcessor.calculateNewMorale(
      this.awayMorale,
      awayResult,
    );
    await Team.patch({
      id: homeId,
      morale: newHomeMorale,
    });
    await Team.patch({
      id: awayId,
      morale: newAwayMorale,
    });
  }

  async finish() {
    // 1. Process non selected players
    await this.postFixtureProcessNonSelectedPlayers();
    // 2. Process occurances
    const playersUpdates = await this.postFixturePreProcessFixtureOccurances();
    // 3. Update players
    await this.postFixtureProcessInvolvedPlayers(playersUpdates);
    // 4. Update team finances
    await this.postFixtureProcessTeamsFinances();
    // 5. Update fixture entity
    await this.postFixtureProcessFixtureEntity();
    // 6. Update teams morales
    await this.postFixtureProcessTeamsMorales();
  }
}

export default Simulator;
