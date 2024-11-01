import PlayerStub from "../../test-utils/stubs/player";
import {
  INJURY_BASELINE,
  INJURY_PRONENESS_SLOPE,
  PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
} from "../constants";
import InjuryCalculator from "../injury";

function simulatorRunner(calculator: InjuryCalculator) {
  return {
    run(player: PlayerStub, qty: number = 100_000) {
      let count = 0;
      for (let i = 0; i < qty; ++i) {
        const injured = calculator.calculate(player.instance);
        if (injured) ++count;
      }
      return count / qty;
    },
  };
}

describe("Injury Calculator", () => {
  describe("Base case", () => {
    const calculator = new InjuryCalculator({
      pastInjuryMultiplier: 0,
      injuryPronenessSlope: 0,
      starMultiplier: 1,
      nonStarMultiplier: 1,
      maxInjuryProbability: 1,
      injuryProbabilityBaseline: INJURY_BASELINE,
    });
    const player = new PlayerStub();
    const simulator = simulatorRunner(calculator);
    it("should injury player about 0.015% of the time", () => {
      const probability = simulator.run(player);
      expect(probability).toBeWithinRange([0.00015, 0.00005]);
    });
  });
  describe("Base case + injury proneness", () => {
    const calculator = new InjuryCalculator({
      pastInjuryMultiplier: 0,
      injuryPronenessSlope: INJURY_PRONENESS_SLOPE,
      starMultiplier: 1,
      nonStarMultiplier: 1,
      maxInjuryProbability: 1,
      injuryProbabilityBaseline: INJURY_BASELINE,
    });
    const simulator = simulatorRunner(calculator);
    describe("Player with injury proneness 0", () => {
      it("should injury player about 0.015% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 0,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.00015, 0.00005]);
      });
    });
    describe("Player with injury proneness 2", () => {
      it("should injury player about 0.018% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 2,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.00018, 0.00005]);
      });
    });
    describe("Player with injury proneness 4", () => {
      it("should injury player 0.026% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 4,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.00026, 0.00005]);
      });
    });
    // FIXME: why the hell this is shorter than proneness 4?
    describe("Player with injury proneness 6", () => {
      it("should injury player 0.020% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 6,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.0002, 0.00005]);
      });
    });
    // FIXME: why the hell this is shorter than proneness 4?
    describe("Player with injury proneness 8", () => {
      it("should injury player 0.024% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 8,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.0024, 0.0005]);
      });
    });
    describe("Player with injury proneness 10", () => {
      it("should injury player 1% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 10,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.01, 0.005]);
      });
    });
  });
  describe("Base case + past injuries", () => {
    const calculator = new InjuryCalculator({
      pastInjuryMultiplier: PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
      injuryPronenessSlope: 0,
      starMultiplier: 1,
      nonStarMultiplier: 1,
      maxInjuryProbability: 1,
      injuryProbabilityBaseline: INJURY_BASELINE,
    });
    const simulator = simulatorRunner(calculator);
    describe("Player with 0 past injuries", () => {
      it("should injury player 0.5% of the time", () => {
        const player = new PlayerStub({
          stats: {
            injuries: 0,
            redcards: 0,
            goals: 0,
            games: 0,
            seasonGoals: 0,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.005, 0.0005]);
      });
    });
    describe("Player with 2 past injuries", () => {
      it("should injury player 0.525% of the time", () => {
        const player = new PlayerStub({
          stats: {
            injuries: 2,
            redcards: 0,
            goals: 0,
            games: 0,
            seasonGoals: 0,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.00525, 0.0005]);
      });
    });
    describe("Player with 4 past injuries", () => {
      it("should injury player 0.525% of the time", () => {
        const player = new PlayerStub({
          stats: {
            injuries: 4,
            redcards: 0,
            goals: 0,
            games: 0,
            seasonGoals: 0,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.00525, 0.0005]);
      });
    });
    describe("Player with 6 past injuries", () => {
      it("should injury player 0.55% of the time", () => {
        const player = new PlayerStub({
          stats: {
            injuries: 6,
            redcards: 0,
            goals: 0,
            games: 0,
            seasonGoals: 0,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.0055, 0.0005]);
      });
    });
    describe("Player with 8 past injuries", () => {
      it("should injury player 0.6% of the time", () => {
        const player = new PlayerStub({
          stats: {
            injuries: 8,
            redcards: 0,
            goals: 0,
            games: 0,
            seasonGoals: 0,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.006, 0.0005]);
      });
    });
    describe("Player with 10 past injuries", () => {
      it("should injury player 1% of the time", () => {
        const player = new PlayerStub({
          stats: {
            injuries: 10,
            redcards: 0,
            goals: 0,
            games: 0,
            seasonGoals: 0,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.01, 0.005]);
      });
    });
  });
});
