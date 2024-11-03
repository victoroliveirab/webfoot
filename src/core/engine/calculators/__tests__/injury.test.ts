import PlayerStub from "../../test-utils/stubs/player";
import {
  INJURY_BASELINE,
  INJURY_MAX_PROBABILITY,
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
      it("should injury player about 0.019% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 0,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.00019, 0.00005]);
      });
    });
    describe("Player with injury proneness 2", () => {
      it("should injury player about 0.0207% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 2,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.000207, 0.00005]);
      });
    });
    describe("Player with injury proneness 4", () => {
      it("should injury player 0.0221% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 4,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.000221, 0.00005]);
      });
    });
    describe("Player with injury proneness 6", () => {
      it("should injury player 0.0235% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 6,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.000235, 0.00005]);
      });
    });
    describe("Player with injury proneness 8", () => {
      it("should injury player 0.0249% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 8,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.000249, 0.0005]);
      });
    });
    describe("Player with injury proneness 10", () => {
      it("should injury player 0.0263% of the time", () => {
        const player = new PlayerStub({
          internal: {
            injuryProneness: 10,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([0.000263, 0.0005]);
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
      it("should injury player 0.019% of the time", () => {
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
        expect(probability).toBeWithinRange([0.00019, 0.0005]);
      });
    });
    describe("Player with 2 past injuries", () => {
      it("should injury player 0.020% of the time", () => {
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
        expect(probability).toBeWithinRange([0.0002, 0.0005]);
      });
    });
    describe("Player with 4 past injuries", () => {
      it("should injury player 0.021% of the time", () => {
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
        expect(probability).toBeWithinRange([0.00021, 0.0005]);
      });
    });
    describe("Player with 6 past injuries", () => {
      it("should injury player 0.021% of the time", () => {
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
        expect(probability).toBeWithinRange([0.00021, 0.0005]);
      });
    });
    describe("Player with 8 past injuries", () => {
      it("should injury player 0.022% of the time", () => {
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
        expect(probability).toBeWithinRange([0.00022, 0.0005]);
      });
    });
    describe("Player with 10 past injuries", () => {
      it("should injury player 0.023% of the time", () => {
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
        expect(probability).toBeWithinRange([0.00023, 0.0005]);
      });
    });
  });
  describe("Base case + injury proneness + past injuries", () => {
    const calculator = new InjuryCalculator({
      pastInjuryMultiplier: PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
      injuryPronenessSlope: INJURY_PRONENESS_SLOPE,
      starMultiplier: 1,
      nonStarMultiplier: 1,
      maxInjuryProbability: INJURY_MAX_PROBABILITY,
      injuryProbabilityBaseline: INJURY_BASELINE,
    });
    const simulator = simulatorRunner(calculator);
    it.each([
      [0, 0, 0.00019],
      [0, 2, 0.0002],
      [0, 4, 0.00021],
      [0, 6, 0.00021],
      [0, 8, 0.00022],
      [0, 10, 0.00023],
      [2, 0, 0.000207],
      [2, 2, 0.000214],
      [2, 4, 0.00022],
      [2, 6, 0.000227],
      [2, 8, 0.000234],
      [2, 10, 0.00024],
      [4, 0, 0.000221],
      [4, 2, 0.000228],
      [4, 4, 0.000234],
      [4, 6, 0.000241],
      [4, 8, 0.000248],
      [4, 10, 0.000254],
      [6, 0, 0.000235],
      [6, 2, 0.000241],
      [6, 4, 0.000248],
      [6, 6, 0.000255],
      [6, 8, 0.000261],
      [6, 10, 0.000268],
      [8, 0, 0.000249],
      [8, 2, 0.000255],
      [8, 4, 0.000262],
      [8, 6, 0.000269],
      [8, 8, 0.000275],
      [8, 10, 0.000282],
      [10, 0, 0.000263],
      [10, 2, 0.000269],
      [10, 4, 0.000276],
      [10, 6, 0.000283],
      [10, 8, 0.000289],
      [10, 10, 0.000296],
    ])(
      "should injury player (injuryProneness=%i) (pastInjuries=%i) %f of the time",
      (injuryProneness, pastInjuries, expected) => {
        const player = new PlayerStub({
          stats: {
            injuries: pastInjuries,
            redcards: 0,
            goals: 0,
            games: 0,
            seasonGoals: 0,
          },
          internal: {
            injuryProneness,
          },
        });
        const probability = simulator.run(player);
        expect(probability).toBeWithinRange([expected, 0.00005]);
      },
    );
  });
});
