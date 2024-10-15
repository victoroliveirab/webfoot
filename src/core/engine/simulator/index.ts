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
};

type TickUpdates = {
  newScoreLine: [number, number];
  newStories: Story[];
};

class Simulator {
  fixture: IFixture;
  private homeSquadRecord: SquadRecord;
  private awaySquadRecord: SquadRecord;
  private homeMorale: number;
  private awayMorale: number;
  private clock: number = 0;
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

    this.attendees = randomWeighted(1_000, params.stadiumCapacity, params.homeMorale);
  }

  tick(): TickUpdates {
    let homeGoals = this.scoreline[this.clock][0];
    let awayGoals = this.scoreline[this.clock][1];
    this.clock++;
    const updates: TickUpdates = {
      newScoreLine: [homeGoals, awayGoals],
      newStories: [],
    };

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
      updates.newStories.push({
        type: "GOAL_REGULAR",
        playerId: scorer.id,
        time: this.clock,
      });
    } else if (hasAwayScored) {
      awayGoals++;
      const scorer = calculateScorer(this.awaySquadRecord.playing);
      updates.newStories.push({
        type: "GOAL_REGULAR",
        playerId: scorer.id,
        time: this.clock,
      });
    }
    updates.newScoreLine = [homeGoals, awayGoals];

    const homePlayersSentOffCandidates = this.homeSquadRecord.playing
      .map(calculateRedCardPlayer)
      .map((sentOff, i) => (sentOff ? i : -1))
      .filter((el) => el >= 0);
    const awayPlayersSentOffCandidates = this.awaySquadRecord.playing
      .map(calculateRedCardPlayer)
      .map((sentOff, i) => (sentOff ? i : -1))
      .filter((el) => el >= 0);

    if (homePlayersSentOffCandidates.length > 0) {
      const sentOffPlayer = this.homeSquadRecord.playing[pickRandom(homePlayersSentOffCandidates)];
      this.homeSquadRecord.playing = this.homeSquadRecord.playing.filter(
        ({ id }) => id !== sentOffPlayer.id,
      );
      this.homeSquadRecord.out.push(sentOffPlayer);
      updates.newStories.push({
        playerId: sentOffPlayer.id,
        time: this.clock,
        type: "REDCARD",
      });
    }
    if (awayPlayersSentOffCandidates.length > 0) {
      const sentOffPlayer = this.awaySquadRecord.playing[pickRandom(awayPlayersSentOffCandidates)];
      this.awaySquadRecord.playing = this.awaySquadRecord.playing.filter(
        ({ id }) => id !== sentOffPlayer.id,
      );
      this.awaySquadRecord.out.push(sentOffPlayer);
      updates.newStories.push({
        playerId: sentOffPlayer.id,
        time: this.clock,
        type: "REDCARD",
      });
    }

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
}

export default Simulator;
