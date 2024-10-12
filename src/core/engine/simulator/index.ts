import type { Story } from "@webfoot/core/db/types";
import type { IFixture, IPlayer } from "@webfoot/core/models/types";
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

type SquadRecord = {
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

class Simulator {
  fixture: IFixture;
  private homeSquadRecord: SquadRecord;
  private awaySquadRecord: SquadRecord;
  private homeMorale: number;
  private awayMorale: number;
  private clock: number = 0;
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

  tick(): [number, number] {
    let homeGoals = this.scoreline[this.clock][0];
    let awayGoals = this.scoreline[this.clock][1];
    this.clock++;

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
      this.story.push({
        type: "GOAL_REGULAR",
        playerId: scorer.id,
        time: this.clock,
      });
    } else if (hasAwayScored) {
      awayGoals++;
      const scorer = calculateScorer(this.awaySquadRecord.playing);
      this.story.push({
        type: "GOAL_REGULAR",
        playerId: scorer.id,
        time: this.clock,
      });
    }
    this.scoreline.push([homeGoals, awayGoals]);

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
      this.story.push({
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
      this.story.push({
        playerId: sentOffPlayer.id,
        time: this.clock,
        type: "REDCARD",
      });
    }

    return [homeGoals, awayGoals];
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
}

export default Simulator;