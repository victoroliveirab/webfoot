import PlayerStub from "../../test-utils/stubs/player";
import {
  BASE_DISCIPLINE_FACTOR,
  BASE_TIME_FACTOR,
  COMBINED_FACTOR_MULTIPLIER_MODERATE,
  COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE,
  COMBINED_FACTOR_MULTIPLIER_SEVERE,
  DISCIPLINE_INFLUENCE_FACTOR,
  MAX_DAYS_SUSPENSION,
  TIME_INFLUENCE_FACTOR,
} from "../constants";
import RedCardStoryProcessor from "../red-card-story";

function createMap(max: number = MAX_DAYS_SUSPENSION) {
  const map = new Map<number, number>();
  for (let n = 1; n <= max; ++n) {
    map.set(n, 0);
  }
  return map;
}

function simulatorRunner(processor: RedCardStoryProcessor) {
  return {
    run(player: PlayerStub, redCardTime: number, qty: number = 50_000) {
      const map = createMap();
      for (let i = 0; i < qty; ++i) {
        const number = processor.calculateSuspensionPeriod(player.instance, redCardTime);
        map.set(number, map.get(number)! + 1);
      }
      return map;
    },
  };
}

describe("Red Card Story Processor", () => {
  describe("Match Time Influence", () => {
    const processor = new RedCardStoryProcessor({
      baseTimeFactor: BASE_TIME_FACTOR,
      baseDisciplineFactor: 0,
      maxSuspensionTime: MAX_DAYS_SUSPENSION,
      timeInfluenceMultiplier: 1,
      disciplineInfluenceMultiplier: 0,
      combinedFactorMultiplierSevere: COMBINED_FACTOR_MULTIPLIER_SEVERE,
      combinedFactorMultiplierModerate: COMBINED_FACTOR_MULTIPLIER_MODERATE,
      combinedFactorMultiplierMostSevere: COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE,
    });
    const simulator = simulatorRunner(processor);
    const player = new PlayerStub({
      discipline: 0,
    });
    describe("Red card at 15'", () => {
      it("should have a suspension period randomly distributed around 3 matches", () => {
        const map = simulator.run(player, 15);
        expect(map).toHaveMode(3);
      });
    });
    describe("Red card at 30'", () => {
      it("should have a suspension period randomly distributed around 3 matches", () => {
        const map = simulator.run(player, 30);
        expect(map).toHaveMode(3);
      });
    });
    describe("Red card at 45'", () => {
      it("should have a suspension period randomly distributed around 1 match", () => {
        const map = simulator.run(player, 45);
        expect(map).toHaveMode(1);
      });
    });
    describe("Red card at 60'", () => {
      it("should have a suspension period randomly distributed around 1 match", () => {
        const map = simulator.run(player, 60);
        expect(map).toHaveMode(1);
      });
    });
    describe("Red card at 75'", () => {
      it("should have a suspension period randomly distributed around 1 match", () => {
        const map = simulator.run(player, 75);
        expect(map).toHaveMode(1);
      });
    });
    describe("Red card at 90'", () => {
      it("should have a suspension period randomly distributed around 1 match", () => {
        const map = simulator.run(player, 90);
        expect(map).toHaveMode(1);
      });
    });
  });
  describe("Player's Discipline Influence", () => {
    const processor = new RedCardStoryProcessor({
      baseTimeFactor: 0,
      baseDisciplineFactor: BASE_DISCIPLINE_FACTOR,
      maxSuspensionTime: MAX_DAYS_SUSPENSION,
      timeInfluenceMultiplier: 0,
      disciplineInfluenceMultiplier: 1,
      combinedFactorMultiplierSevere: COMBINED_FACTOR_MULTIPLIER_SEVERE,
      combinedFactorMultiplierModerate: COMBINED_FACTOR_MULTIPLIER_MODERATE,
      combinedFactorMultiplierMostSevere: COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE,
    });
    const simulator = simulatorRunner(processor);
    describe("Player with discipline 0", () => {
      it("should have a suspension period randomly distributed around 3 matches", () => {
        const player = new PlayerStub({
          discipline: 0,
        });
        const map = simulator.run(player, 90);
        expect(map).toHaveMode(3);
      });
    });
    describe("Player with discipline 2", () => {
      it("should have a suspension period randomly distributed around 3 matches", () => {
        const player = new PlayerStub({
          discipline: 2,
        });
        const map = simulator.run(player, 90);
        expect(map).toHaveMode(3);
      });
    });
    describe("Player with discipline 4", () => {
      it("should have a suspension period randomly distributed around 1 match", () => {
        const player = new PlayerStub({
          discipline: 4,
        });
        const map = simulator.run(player, 90);
        expect(map).toHaveMode(1);
      });
    });
    describe("Player with discipline 6", () => {
      it("should have a suspension period randomly distributed around 1 match", () => {
        const player = new PlayerStub({
          discipline: 6,
        });
        const map = simulator.run(player, 90);
        expect(map).toHaveMode(1);
      });
    });
    describe("Player with discipline 8", () => {
      it("should have a suspension period randomly distributed around 1 match", () => {
        const player = new PlayerStub({
          discipline: 8,
        });
        const map = simulator.run(player, 90);
        expect(map).toHaveMode(1);
      });
    });
    describe("Player with discipline 10", () => {
      it("should have a suspension period randomly distributed around 1 match", () => {
        const player = new PlayerStub({
          discipline: 10,
        });
        const map = simulator.run(player, 90);
        expect(map).toHaveMode(1);
      });
    });
  });
  describe("Combined", () => {
    const processor = new RedCardStoryProcessor({
      baseTimeFactor: BASE_TIME_FACTOR,
      baseDisciplineFactor: BASE_DISCIPLINE_FACTOR,
      maxSuspensionTime: MAX_DAYS_SUSPENSION,
      timeInfluenceMultiplier: TIME_INFLUENCE_FACTOR,
      disciplineInfluenceMultiplier: DISCIPLINE_INFLUENCE_FACTOR,
      combinedFactorMultiplierSevere: COMBINED_FACTOR_MULTIPLIER_SEVERE,
      combinedFactorMultiplierModerate: COMBINED_FACTOR_MULTIPLIER_MODERATE,
      combinedFactorMultiplierMostSevere: COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE,
    });
    const simulator = simulatorRunner(processor);
    describe("Red card to Player with discipline 0 at 15'", () => {
      it("should have a suspension period randomly distributed around 3 matches", () => {
        const player = new PlayerStub({
          discipline: 0,
        });
        const map = simulator.run(player, 15);
        expect(map).toHaveMode(3);
      });
    });
    describe("Red card to Player with discipline 0 at 30'", () => {
      it("should have a suspension period randomly distributed around 3 matches", () => {
        const player = new PlayerStub({
          discipline: 0,
        });
        const map = simulator.run(player, 30);
        expect(map).toHaveMode(3);
      });
    });
    describe("Red card to Player with discipline 0 at 45'", () => {
      it("should have a suspension period randomly distributed around 3 matches", () => {
        const player = new PlayerStub({
          discipline: 0,
        });
        const map = simulator.run(player, 45);
        expect(map).toHaveMode(3);
      });
    });
    describe("Red card to Player with discipline 0 at 60'", () => {
      it("should have a suspension period randomly distributed around 3 matches", () => {
        const player = new PlayerStub({
          discipline: 0,
        });
        const map = simulator.run(player, 60);
        expect(map).toHaveMode(3);
      });
    });
    describe("Red card to Player with discipline 0 at 75'", () => {
      it("should have a suspension period randomly distributed around 3 matches", () => {
        const player = new PlayerStub({
          discipline: 0,
        });
        const map = simulator.run(player, 75);
        expect(map).toHaveMode(3);
      });
    });
    describe("Red card to Player with discipline 0 at 90'", () => {
      it("should have a suspension period randomly distributed around 1 match", () => {
        const player = new PlayerStub({
          discipline: 0,
        });
        const map = simulator.run(player, 90);
        expect(map).toHaveMode(1);
      });
    });
  });
});
