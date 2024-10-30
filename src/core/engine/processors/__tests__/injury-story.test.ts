import PlayerStub from "../../test-utils/stubs/player";
import {
  INJURY_PRONENESS_TIME_FACTOR_MULTIPLIER,
  PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
} from "../constants";
import InjuryStoryProcessor from "../injury-story";

function createMap(max: number = 30) {
  const map = new Map<number, number>();
  for (let n = 1; n <= max; ++n) {
    map.set(n, 0);
  }
  return map;
}

function simulatorRunner(processor: InjuryStoryProcessor) {
  return {
    run(player: PlayerStub, qty: number = 50_000) {
      const map = createMap();
      for (let i = 0; i < qty; ++i) {
        const number = processor.calculateInjuryPeriod(player.instance, 0);
        map.set(number, map.get(number)! + 1);
      }
      return map;
    },
  };
}

describe("Injury Story Processor", () => {
  describe("Injury Proneness Influence", () => {
    const processor = new InjuryStoryProcessor({
      injuryPronenessMultiplier: INJURY_PRONENESS_TIME_FACTOR_MULTIPLIER,
      maxTimeInjured: 50,
      previousInjuriesMultiplier: 0,
      previousInjuriesCap: 0,
      timeOfInjuryMultiplier: 0,
    });
    const simulator = simulatorRunner(processor);
    describe("Player with max injury proneness", () => {
      it("should have an injury period normally distributed around 4.5 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 10,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(4.5);
      });
    });
    describe("Player with medium injury proneness", () => {
      it("should have an injury period normally distributed around 2.5 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 5,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(2.5);
      });
    });
    describe("Player with low injury proneness", () => {
      it("should have an injury period normally distributed around 1 match", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(1);
      });
    });
  });

  describe("Previous Injuries Influence", () => {
    const processor = new InjuryStoryProcessor({
      injuryPronenessMultiplier: 0,
      maxTimeInjured: 50,
      previousInjuriesMultiplier: PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
      previousInjuriesCap: 10,
      timeOfInjuryMultiplier: 0,
    });
    const simulator = simulatorRunner(processor);
    describe("Player with number of previous injuries above cap", () => {
      it("should have an injury period normally distributed around 3.5 matches", () => {
        const player = new PlayerStub({
          stats: {
            injuries: 11,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(3.5);
      });
    });
    describe("Player half-way through previous injuries cap", () => {
      it("should have an injury period normally distributed around 2 matches", () => {
        const player = new PlayerStub({
          stats: {
            injuries: 5,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(2);
      });
    });
    describe("Player with no previous injuries", () => {
      it("should have an injury period normally distributed around 1 match", () => {
        const player = new PlayerStub({
          stats: {
            injuries: 0,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(1);
      });
    });
  });

  describe("Combined factors", () => {
    const processor = new InjuryStoryProcessor({
      injuryPronenessMultiplier: INJURY_PRONENESS_TIME_FACTOR_MULTIPLIER,
      maxTimeInjured: 50,
      previousInjuriesMultiplier: PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
      previousInjuriesCap: 10,
      timeOfInjuryMultiplier: 0,
    });
    const simulator = simulatorRunner(processor);

    describe("Player with high injury proneness and previous injuries above cap", () => {
      it("should have an injury period normally distributed around 7.5 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 10,
          },
          stats: {
            injuries: 11,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(7.5);
      });
    });
    describe("Player with high injury proneness and half-way through previous injuries cap", () => {
      it("should have an injury period normally distributed around 6.5 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 10,
          },
          stats: {
            injuries: 5,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(6.5);
      });
    });
    describe("Player with high injury proneness and no previous injuries", () => {
      it("should have an injury period normally distributed around 4.5 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 10,
          },
          stats: {
            injuries: 0,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(4.5);
      });
    });
    describe("Player with medium injury proneness and previous injuries above cap", () => {
      it("should have an injury period normally distributed around 5.5 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 5,
          },
          stats: {
            injuries: 11,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(5.5);
      });
    });
    describe("Player with medium injury proneness and half-way through previous injuries cap", () => {
      it("should have an injury period normally distributed around 4.5 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 5,
          },
          stats: {
            injuries: 5,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(4.5);
      });
    });
    describe("Player with medium injury proneness and no previous injuries", () => {
      it("should have an injury period normally distributed around 2.5 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 5,
          },
          stats: {
            injuries: 0,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(2.5);
      });
    });
    describe("Player with low injury proneness and previous injuries above cap", () => {
      it("should have an injury period normally distributed around 3.5 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 0,
          },
          stats: {
            injuries: 11,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(3.5);
      });
    });
    describe("Player with low injury proneness and half-way through previous injuries cap", () => {
      it("should have an injury period normally distributed around 2 matches", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 0,
          },
          stats: {
            injuries: 5,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(2);
      });
    });
    describe("Player with low injury proneness and no previous injuries", () => {
      it("should have an injury period normally distributed around 1 match", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 0,
          },
          stats: {
            injuries: 0,
            games: 0,
            goals: 0,
            redcards: 0,
            seasonGoals: 0,
          },
        });
        const map = simulator.run(player);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(1);
      });
    });
  });
});
