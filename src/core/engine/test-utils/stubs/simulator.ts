import type { IPlayer } from "@webfoot/core/models/types";
import type { Story } from "@webfoot/core/db/types";

import Simulator from "../../simulator";

export default class SimulatorStub extends Simulator {
  constructor() {
    super({
      awayMorale: 0,
      homeMorale: 0,
      fixture: {
        id: 1,
        round: 1,
        homeId: 1,
        awayId: 2,
        occurred: true,
        attendees: 0,
        awayGoals: 0,
        awaySquad: {
          firstTeam: [],
          substitutes: [],
        },
        homeGoals: 0,
        homeSquad: {
          firstTeam: [],
          substitutes: [],
        },
        homeAwayHash: "1-2",
        championshipId: 0,
      },
      awayInitialSquad: {
        playing: [],
        bench: [],
        out: [],
      },
      stadiumCapacity: 0,
      homeInitialSquad: {
        playing: [],
        bench: [],
        out: [],
      },
      awayTeamIsHumanControlled: true,
      homeTeamIsHumanControlled: false,
    });
  }

  injectStories(...stories: Story[]) {
    for (const story of stories) {
      this.story.push(story);
    }
  }

  injectHumanPlayingPlayers(...players: IPlayer[]) {
    for (const player of players) {
      this.homeSquadRecord.playing.push(player);
    }
  }
  injectHumanBenchPlayers(...players: IPlayer[]) {
    for (const player of players) {
      this.homeSquadRecord.bench.push(player);
    }
  }
  injectHumanOutPlayers(...players: IPlayer[]) {
    for (const player of players) {
      this.homeSquadRecord.out.push(player);
    }
  }
  injectAIPlayingPlayers(...players: IPlayer[]) {
    for (const player of players) {
      this.awaySquadRecord.playing.push(player);
    }
  }
  injectAIBenchPlayers(...players: IPlayer[]) {
    for (const player of players) {
      this.awaySquadRecord.bench.push(player);
    }
  }
  injectAIOutPlayers(...players: IPlayer[]) {
    for (const player of players) {
      this.awaySquadRecord.out.push(player);
    }
  }

  injectClock(clock: number) {
    this.clock = clock;
  }
}
