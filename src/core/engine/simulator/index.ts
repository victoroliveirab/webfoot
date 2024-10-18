import type { Story } from "@webfoot/core/db/types";
import type { IFixture, IPlayer, ITeam } from "@webfoot/core/models/types";
import { pickRandom } from "@webfoot/utils/array";
import { randomWeighted } from "@webfoot/utils/math";

import {
  GOAL_PROBABILITY_SCALING_FACTOR,
  RANDOM_FACTOR_MIN,
  RANDOM_FACTOR_RANGE,
} from "./constants";
import calculateTeamStrength from "../calculators/team-strength";
import calculateScorer from "../calculators/goal-scorer";
import calculateRedCardPlayer from "../calculators/red-card";
import calculateInjuryPlayer from "../calculators/injury";
import playerSorter, { playerSorterByPower } from "../sorters/player";

export type SquadRecord = {
  playing: IPlayer[];
  bench: IPlayer[];
  out: IPlayer[];
};

type SimulatorConstructorParams = {
  awayInitialSquad: SquadRecord;
  awayMorale: number;
  fixture: IFixture;
  homeInitialSquad: SquadRecord;
  homeMorale: number;
  stadiumCapacity: number;
  homeTeamIsHumanControlled: boolean;
  awayTeamIsHumanControlled: boolean;
};

type TickUpdates = {
  newScoreLine: [number, number];
  newStories: Story[];
};

class Simulator {
  fixture: IFixture;
  private homeSquadRecord: SquadRecord;
  private awaySquadRecord: SquadRecord;
  readonly homeMorale: number;
  readonly awayMorale: number;
  private clock: number = 0;
  readonly homeTeamIsHumanControlled: boolean;
  readonly awayTeamIsHumanControlled: boolean;
  homeSubsLeft: number = 3;
  awaySubsLeft: number = 3;
  // This will end up with 91 values (0-90 min) which is fine
  scoreline: [number, number][] = [[0, 0]];
  attendees: number;
  private story: Story[] = [];

  constructor(params: SimulatorConstructorParams) {
    this.fixture = params.fixture;
    this.homeMorale = params.homeMorale;
    this.awayMorale = params.awayMorale;

    this.homeSquadRecord = params.homeInitialSquad;
    this.awaySquadRecord = params.awayInitialSquad;
    this.homeTeamIsHumanControlled = params.homeTeamIsHumanControlled;
    this.awayTeamIsHumanControlled = params.awayTeamIsHumanControlled;

    this.attendees = randomWeighted(1_000, params.stadiumCapacity, params.homeMorale);
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

    // OPTIMIZE: cache this number and only recalculate on sub/injury/redcard
    const homeTeamStrength = calculateTeamStrength(this.homeSquadRecord.playing, this.homeMorale);
    const awayTeamStrength = calculateTeamStrength(this.awaySquadRecord.playing, this.awayMorale);

    const randomFactorHome = Math.random() * RANDOM_FACTOR_RANGE + RANDOM_FACTOR_MIN;
    const randomFactorAway = Math.random() * RANDOM_FACTOR_RANGE + RANDOM_FACTOR_MIN;

    const attackHome = homeTeamStrength.attack * randomFactorHome;
    const defenseHome = homeTeamStrength.defense * randomFactorHome;
    const attackAway = awayTeamStrength.attack * randomFactorAway;
    const defenseAway = awayTeamStrength.defense * randomFactorAway;

    const probabilityGoalsHome = attackHome / (defenseAway * GOAL_PROBABILITY_SCALING_FACTOR);
    const probabilityGoalsAway = attackAway / (defenseHome * GOAL_PROBABILITY_SCALING_FACTOR);

    const hasHomeScored = Math.random() < probabilityGoalsHome;
    const hasAwayScored = Math.random() < probabilityGoalsAway;

    if (hasHomeScored) {
      homeGoals++;
      const scorer = calculateScorer(this.homeSquadRecord.playing);
      updateArr.newStories.push({
        type: "GOAL_REGULAR",
        playerId: scorer.id,
        time: this.clock,
      });
      // The else if is intentional to slightly favor home teams
    } else if (hasAwayScored) {
      awayGoals++;
      const scorer = calculateScorer(this.awaySquadRecord.playing);
      updateArr.newStories.push({
        type: "GOAL_REGULAR",
        playerId: scorer.id,
        time: this.clock,
      });
    }
    updateArr.newScoreLine = [homeGoals, awayGoals];
  }

  private substituteIAInjuredPlayer(teamId: ITeam["id"], injuriedPlayer: IPlayer) {
    const bench = this.getSquadByTeamId(teamId).bench;
    const hasSubPlayersAvailable = bench.length > 0;
    const isHomeTeam = this.getIsTeamHomeByTeamId(teamId);
    const hasSubsLeft = isHomeTeam ? this.homeSubsLeft > 0 : this.awaySubsLeft > 0;
    if (!hasSubPlayersAvailable || !hasSubsLeft) {
      this.removePlayingPlayer(teamId, injuriedPlayer.id);
      return;
    }
    const bestSubCandidateIndex = bench.findIndex(
      ({ position }) => position === injuriedPlayer.position,
    );
    if (bestSubCandidateIndex >= 0) {
      this.substitutePlayers(teamId, injuriedPlayer.id, bench[bestSubCandidateIndex].id);
      return;
    }
    // No player from the same position
    if (injuriedPlayer.position === "G") {
      console.log("injuried player is GK");
      // If the injuried player is a GK and there's no GK available
      // Use the most defensive player we can find
      const bestSub = bench.toSorted(playerSorter)[0];
      this.substitutePlayers(teamId, injuriedPlayer.id, bestSub.id);
      return;
    }
    // No player from the same position, but injuried player is not GK
    const currentScoreline = this.scoreline[this.clock - 1]; // We already advanced the clock
    const isLosing = isHomeTeam
      ? currentScoreline[0] < currentScoreline[1]
      : currentScoreline[1] < currentScoreline[0];
    const isWinning = isHomeTeam
      ? currentScoreline[0] > currentScoreline[1]
      : currentScoreline[1] > currentScoreline[0];
    let bestSub: IPlayer;
    if (isWinning) {
      // NOTE: the following will get player by alphabetical order instead of power
      // If it's winning, better put the most defensive player to play
      bestSub = bench.toSorted(playerSorter)[0];
    } else if (isLosing) {
      // NOTE: the following will get player by alphabetical order instead of power
      // If it's losing, better put the most offensive player to play
      bestSub = bench.toSorted(playerSorter)[bench.length - 1];
    } else {
      // NOTE: this should be a midfielder ideally, but whatever
      // If it's drawing, just put the best player
      bestSub = bench.toSorted(playerSorterByPower)[0];
    }
    this.substitutePlayers(teamId, injuriedPlayer.id, bestSub.id);
  }

  private calculateInjuries(updateArr: TickUpdates) {
    const homePlayersInjuryCandidates = this.homeSquadRecord.playing
      .map(calculateInjuryPlayer)
      .map((injuried, i) => (injuried ? i : -1))
      .filter((el) => el >= 0);
    const awayPlayersInjuryCandidates = this.awaySquadRecord.playing
      .map(calculateInjuryPlayer)
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
      if (!this.homeTeamIsHumanControlled) {
        // Home team is not human controlled, so let's do the substitution automatically
        this.substituteIAInjuredPlayer(this.fixture.homeId, injuriedPlayer);
      }
    }
    if (awayPlayersInjuryCandidates.length > 0) {
      const injuriedPlayer = this.awaySquadRecord.playing[pickRandom(awayPlayersInjuryCandidates)];
      updateArr.newStories.push({
        playerId: injuriedPlayer.id,
        time: this.clock,
        type: "INJURY",
      });
      if (!this.awayTeamIsHumanControlled) {
        // Away team is not human controlled, so let's do the substitution automatically
        this.substituteIAInjuredPlayer(this.fixture.awayId, injuriedPlayer);
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
        .map(calculateRedCardPlayer)
        .map((sentOff, i) => (sentOff ? i : -1))
        .filter((el) => el >= 0);
      if (homePlayersSentOffCandidates.length > 0) {
        const sentOffPlayer =
          this.homeSquadRecord.playing[pickRandom(homePlayersSentOffCandidates)];
        this.homeSquadRecord.playing = this.homeSquadRecord.playing.filter(
          ({ id }) => id !== sentOffPlayer.id,
        );
        this.homeSquadRecord.out.push(sentOffPlayer);
        updateArr.newStories.push({
          playerId: sentOffPlayer.id,
          time: this.clock,
          type: "REDCARD",
        });
      }
    }

    const awayTeamHasInjuriedPlayer = this.awaySquadRecord.out.some(({ id }) =>
      newInjuriedPlayers.includes(id),
    );
    if (!awayTeamHasInjuriedPlayer) {
      const awayPlayersSentOffCandidates = this.awaySquadRecord.playing
        .map(calculateRedCardPlayer)
        .map((sentOff, i) => (sentOff ? i : -1))
        .filter((el) => el >= 0);
      if (awayPlayersSentOffCandidates.length > 0) {
        const sentOffPlayer =
          this.awaySquadRecord.playing[pickRandom(awayPlayersSentOffCandidates)];
        this.awaySquadRecord.playing = this.awaySquadRecord.playing.filter(
          ({ id }) => id !== sentOffPlayer.id,
        );
        this.awaySquadRecord.out.push(sentOffPlayer);
        updateArr.newStories.push({
          playerId: sentOffPlayer.id,
          time: this.clock,
          type: "REDCARD",
        });
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
    return this.scoreline[this.clock];
  }

  get lastOccurance() {
    if (this.story.length === 0) return;
    return this.story[this.story.length - 1];
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

  substitutePlayers(teamId: ITeam["id"], playerOut: IPlayer["id"], playerIn: IPlayer["id"]) {
    const squadRecord =
      teamId === this.fixture.homeId ? this.homeSquadRecord : this.awaySquadRecord;
    const leavingPlayer = squadRecord.playing.findIndex((player) => player.id === playerOut);
    const joiningPlayer = squadRecord.bench.findIndex((player) => player.id === playerIn);
    if (leavingPlayer < 0 || joiningPlayer < 0)
      throw new Error("Cannot switch players that don't belong to team");
    const outPlayer = squadRecord.playing[leavingPlayer];
    squadRecord.playing.splice(leavingPlayer, 1, squadRecord.bench[joiningPlayer]);
    squadRecord.bench.splice(joiningPlayer, 1);
    squadRecord.out.push(outPlayer);
    if (teamId === this.fixture.homeId) {
      this.homeSubsLeft--;
    } else {
      this.awaySubsLeft--;
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
}

export default Simulator;
