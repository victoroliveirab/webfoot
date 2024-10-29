import type { IPlayer } from "@webfoot/core/models/types";
import type { Story } from "@webfoot/core/db/types";

import DummyGoalScoredCalculator from "../dummies/calculators/goal-scored";
import DummyInjuryCalculator from "../dummies/calculators/injury";
import DummyRedCardCalculator from "../dummies/calculators/red-card";
import DummyTeamStrengthCalculator from "../dummies/calculators/team-strength";
import DummyMoraleChangeProcessor from "../dummies/processors/morale-change";
import DummyInjuryStoryProcessor from "../dummies/processors/injury-story";
import DummyRedCardStoryProcessor from "../dummies/processors/red-card-story";
import DummyPlayerPowerChangePostFixtureProcessor from "../dummies/processors/player-power-change-post-fixture";
import Simulator from "../../simulator";

export default class SimulatorStub extends Simulator {
  constructor() {
    super({
      awayTeam: {
        squad: {
          bench: [],
          playing: [],
          out: [],
        },
        morale: 0,
      },
      homeTeam: {
        squad: {
          bench: [],
          playing: [],
          out: [],
        },
        morale: 0,
      },
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
        benchSize: 5,
      },
      stadiumCapacity: 0,
      calculators: {
        injuryCalculator: new DummyInjuryCalculator(),
        redcardCalculator: new DummyRedCardCalculator(),
        goalScoredCalculator: new DummyGoalScoredCalculator(),
        teamStrengthCalculator: new DummyTeamStrengthCalculator(),
      },
      processors: {
        awayTeamMoraleChangeProcessor: new DummyMoraleChangeProcessor(),
        homeTeamMoraleChangeProcessor: new DummyMoraleChangeProcessor(),
        injuryStoryProcessor: new DummyInjuryStoryProcessor(),
        redCardStoryProcessor: new DummyRedCardStoryProcessor(),
        playerPowerChangeProcessor: new DummyPlayerPowerChangePostFixtureProcessor(),
      },
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
