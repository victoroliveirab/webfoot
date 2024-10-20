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
import playerSorter, {
  playerSorterByDeffensivePower,
  playerSorterByOffensivePower,
  playerSorterByPower,
  playerSorterByPowerReverse,
} from "../sorters/player";
import {
  getGreatestPowerOfEachPosition,
  getPlayerPositionSortValue,
  getSmallestPowerOfEachPosition,
} from "./helpers";

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
  protected homeSquadRecord: SquadRecord;
  protected awaySquadRecord: SquadRecord;
  readonly homeMorale: number;
  readonly awayMorale: number;
  protected clock: number = 0;
  readonly homeTeamIsHumanControlled: boolean;
  readonly awayTeamIsHumanControlled: boolean;
  homeSubsLeft: number = 3;
  awaySubsLeft: number = 3;
  // This will end up with 91 values (0-90 min) which is fine
  scoreline: [number, number][] = [[0, 0]];
  attendees: number;
  protected story: Story[] = [];

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

  private substituteIAInjuredPlayer(
    teamId: ITeam["id"],
    injuriedPlayer: IPlayer,
    updateArr: TickUpdates,
  ) {
    const { bench } = this.getSquadByTeamId(teamId);
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
      this.substitutePlayers(teamId, injuriedPlayer.id, bench[bestSubCandidateIndex].id, updateArr);
      return;
    }
    const bestBenched = getGreatestPowerOfEachPosition(bench);
    // No player from the same position
    if (injuriedPlayer.position === "G") {
      // If the injuried player is a GK and there's no GK available
      // Use the most defensive player we can find
      const bestSub = bestBenched.D || bestBenched.M || bestBenched.A!;
      this.substitutePlayers(teamId, injuriedPlayer.id, bestSub.id, updateArr);
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

    let bestSub: IPlayer | null;
    if (isWinning) {
      // If it's winning, better put the most defensive player to play
      bestSub = bestBenched.D || bestBenched.M || bestBenched.A;
    } else if (isLosing) {
      // If it's losing, better put the most offensive player to play
      bestSub = bestBenched.A || bestBenched.M || bestBenched.D!;
    } else {
      // If it's drawing, just put the best player
      bestSub = bench.filter(({ position }) => position !== "G").toSorted(playerSorterByPower)[0];
    }
    if (bestSub) {
      this.substitutePlayers(teamId, injuriedPlayer.id, bestSub.id, updateArr);
    } else {
      this.removePlayingPlayer(teamId, injuriedPlayer.id);
    }
  }

  private substituteIAAfterRedCard(
    teamId: ITeam["id"],
    sentOffPlayer: IPlayer,
    updateArr: TickUpdates,
  ) {
    const { bench, playing } = this.getSquadByTeamId(teamId);
    const hasSubPlayersAvailable = bench.length > 0;
    const isHomeTeam = this.getIsTeamHomeByTeamId(teamId);
    const hasSubsLeft = isHomeTeam ? this.homeSubsLeft > 0 : this.awaySubsLeft > 0;
    if (!hasSubPlayersAvailable || !hasSubsLeft) {
      this.removePlayingPlayer(teamId, sentOffPlayer.id);
      return;
    }

    const wasGKSentOff = sentOffPlayer.position === "G";
    const [homeGoals, awayGoals] = this.currentScoreline;
    const isTeamLosing = isHomeTeam ? homeGoals < awayGoals : awayGoals < homeGoals;

    if (wasGKSentOff) {
      const subGK = bench.find(({ position }) => position === "G");
      // A GK was sent off, and we have a GK available to enter
      if (subGK) {
        // If team is losing, we want to remove the worst non-attacking player to put the new GK
        // If team is winning/drawing, we want to remove the worst non-defending player to put the new GK
        const playingSquad = playing
          .filter(({ id }) => id !== sentOffPlayer.id)
          .toSorted(isTeamLosing ? playerSorterByDeffensivePower : playerSorterByOffensivePower);
        let index = 1;
        while (
          index < playingSquad.length &&
          playingSquad[index].position === playingSquad[index - 1].position
        )
          ++index;
        const subbedPlayer = playingSquad[index - 1];
        this.removePlayingPlayer(teamId, sentOffPlayer.id);
        this.substitutePlayers(teamId, subbedPlayer.id, subGK.id, updateArr);
      } else {
        // A GK was sent off, but we don't have any GK available to enter
        // Later we can add logic here, for now let's just imagine that it's better to not sub anyone
        this.removePlayingPlayer(teamId, sentOffPlayer.id);
      }
      return;
    }

    const playingSquad = playing.filter(({ id }) => id !== sentOffPlayer.id);

    // Player sent off was not a GK
    if (isTeamLosing) {
      // If team is losing, we want to remove the worst defensive player and put the best offensive
      // NOTE: this is far from perfect (e.g. if we have A power 1 on bench and M power 50
      // and we want to try to swap with D of power 10, the comparison will happen to A, even though
      // the best move is to place M 50 on D 10)
      const worstPlayingPlayers = getSmallestPowerOfEachPosition(playingSquad);
      const subbedPlayer = worstPlayingPlayers.D || worstPlayingPlayers.M || worstPlayingPlayers.A!;
      const bestBenchedPlayers = getGreatestPowerOfEachPosition(bench);
      const joiningPlayer = bestBenchedPlayers.A || bestBenchedPlayers.M || bestBenchedPlayers.D;
      if (joiningPlayer && joiningPlayer.power >= subbedPlayer.power) {
        this.removePlayingPlayer(teamId, sentOffPlayer.id);
        this.substitutePlayers(teamId, subbedPlayer.id, joiningPlayer.id, updateArr);
      } else {
        this.removePlayingPlayer(teamId, sentOffPlayer.id);
      }
      return;
    } else {
      // If team is winning/drawing, we want to remove the worst attakcing player and put the best deffensive
      // NOTE: Like the previous example
      const worstPlayingPlayers = getSmallestPowerOfEachPosition(playingSquad);
      const subbedPlayer = worstPlayingPlayers.A || worstPlayingPlayers.M || worstPlayingPlayers.D!;
      const bestBenchedPlayers = getGreatestPowerOfEachPosition(bench);
      const joiningPlayer = bestBenchedPlayers.D || bestBenchedPlayers.M || bestBenchedPlayers.A;
      if (joiningPlayer && joiningPlayer.power >= subbedPlayer.power) {
        this.removePlayingPlayer(teamId, sentOffPlayer.id);
        this.substitutePlayers(teamId, subbedPlayer.id, joiningPlayer.id, updateArr);
      } else {
        this.removePlayingPlayer(teamId, sentOffPlayer.id);
      }
      return;
    }
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
        this.substituteIAInjuredPlayer(this.fixture.homeId, injuriedPlayer, updateArr);
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
        this.substituteIAInjuredPlayer(this.fixture.awayId, injuriedPlayer, updateArr);
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
        updateArr.newStories.push({
          playerId: sentOffPlayer.id,
          time: this.clock,
          type: "REDCARD",
        });
        if (!this.homeTeamIsHumanControlled) {
          this.substituteIAAfterRedCard(this.fixture.homeId, sentOffPlayer, updateArr);
        }
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
}

export default Simulator;
