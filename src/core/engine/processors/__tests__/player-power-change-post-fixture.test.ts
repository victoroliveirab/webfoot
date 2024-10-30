import { exponentialFunctionFactory, quadraticFunctionFactory } from "@webfoot/utils/math";

import PlayerStub from "../../test-utils/stubs/player";
import {
  CONSTANT_FACTOR_POWER_DECREASE,
  CONSTANT_FACTOR_POWER_INCREASE,
  EXPONENTIAL_FACTOR_POWER_DECREASE,
  INCREASE_DECREASE_POWER_TIME_THRESHOLD,
  INCREASE_UNDERUSED_PLAYER_POWER_PROBABILITY,
  INJURY_FACTOR_POWER_DECREASE,
  LINEAR_FACTOR_POWER_INCREASE,
  QUADRATIC_FACTOR_POWER_INCREASE,
} from "../constants";
import PlayerPowerChangePostFixtureProcessor from "../player-power-change-post-fixture";

const DEFAULT_NUMBER_OF_RUNS = 50_000;
const DEFAULT_ERROR_MARGIN = 0.03;

function createMap(min: number, max: number = 30) {
  const map = new Map<number, number>();
  for (let n = min; n <= max; ++n) {
    map.set(n, 0);
  }
  return map;
}

function simulatorRunner(processor: PlayerPowerChangePostFixtureProcessor) {
  return {
    run(
      map: Map<number, number>,
      player: PlayerStub,
      playedTime: number,
      injuryPeriod: number,
      qty: number = DEFAULT_NUMBER_OF_RUNS,
    ) {
      for (let i = 0; i < qty; ++i) {
        const number = processor.calculateNewPower(player.instance, playedTime, injuryPeriod);
        map.set(number, map.get(number)! + 1);
      }
    },
  };
}

const player = new PlayerStub({
  power: 30,
});
const processor = new PlayerPowerChangePostFixtureProcessor({
  powerDecreaseProbabilityCalculator: exponentialFunctionFactory(
    CONSTANT_FACTOR_POWER_DECREASE,
    EXPONENTIAL_FACTOR_POWER_DECREASE,
  ),
  powerIncreaseProbabilityCalculator: quadraticFunctionFactory(
    QUADRATIC_FACTOR_POWER_INCREASE,
    LINEAR_FACTOR_POWER_INCREASE,
    CONSTANT_FACTOR_POWER_INCREASE,
  ),
  probabilityPlayerNotUsedIncreasePower: INCREASE_UNDERUSED_PLAYER_POWER_PROBABILITY,
  increaseVsDecreaseTimeThreshold: INCREASE_DECREASE_POWER_TIME_THRESHOLD,
  powerDecreaseInjuryFactor: INJURY_FACTOR_POWER_DECREASE,
});
const simulator = simulatorRunner(processor);

describe("Player Power Change Post Fixture Processor", () => {
  describe("Player not used", () => {
    it(`should increase power approximately ${INCREASE_UNDERUSED_PLAYER_POWER_PROBABILITY * 100}% of the time`, () => {
      const map = createMap(player.instance.power, player.instance.power + 1);
      simulator.run(map, player, 0, 0);
      const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
      const powerIncreasedPercentage = map.get(player.instance.power + 1)! / DEFAULT_NUMBER_OF_RUNS;
      expect(powerIncreasedPercentage).toBeWithinRange([
        INCREASE_UNDERUSED_PLAYER_POWER_PROBABILITY,
        DEFAULT_ERROR_MARGIN,
      ]);
      expect(samePowerPercentage).toBeWithinRange([
        1 - INCREASE_UNDERUSED_PLAYER_POWER_PROBABILITY,
        DEFAULT_ERROR_MARGIN,
      ]);
    });
  });
  describe("Player used, not injured", () => {
    describe("Player underused", () => {
      describe("Player played 15 minutes", () => {
        it("should increase power approximately 33% of the time", () => {
          const map = createMap(player.instance.power, player.instance.power + 1);
          simulator.run(map, player, 15, 0);
          const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
          const powerIncreasedPercentage =
            map.get(player.instance.power + 1)! / DEFAULT_NUMBER_OF_RUNS;
          expect(powerIncreasedPercentage).toBeWithinRange([0.33, DEFAULT_ERROR_MARGIN]);
          expect(samePowerPercentage).toBeWithinRange([0.67, DEFAULT_ERROR_MARGIN]);
        });
      });
      describe("Player played 30 minutes", () => {
        it("should increase power approximately 26% of the time", () => {
          const map = createMap(player.instance.power, player.instance.power + 1);
          simulator.run(map, player, 30, 0);
          const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
          const powerIncreasedPercentage =
            map.get(player.instance.power + 1)! / DEFAULT_NUMBER_OF_RUNS;
          expect(powerIncreasedPercentage).toBeWithinRange([0.26, DEFAULT_ERROR_MARGIN]);
          expect(samePowerPercentage).toBeWithinRange([0.74, DEFAULT_ERROR_MARGIN]);
        });
      });
      describe("Player played 45 minutes", () => {
        it("should increase power approximately 25% of the time", () => {
          const map = createMap(player.instance.power, player.instance.power + 1);
          simulator.run(map, player, 45, 0);
          const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
          const powerIncreasedPercentage =
            map.get(player.instance.power + 1)! / DEFAULT_NUMBER_OF_RUNS;
          expect(powerIncreasedPercentage).toBeWithinRange([0.25, DEFAULT_ERROR_MARGIN]);
          expect(samePowerPercentage).toBeWithinRange([0.75, DEFAULT_ERROR_MARGIN]);
        });
      });
    });
    describe("Player overused", () => {
      describe("Player played 46 minutes", () => {
        it("should decrease power approximately 55% of the time", () => {
          const map = createMap(player.instance.power - 1, player.instance.power);
          simulator.run(map, player, 46, 0);
          const powerDecreasedPercentage =
            map.get(player.instance.power - 1)! / DEFAULT_NUMBER_OF_RUNS;
          const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
          expect(powerDecreasedPercentage).toBeWithinRange([0.55, DEFAULT_ERROR_MARGIN]);
          expect(samePowerPercentage).toBeWithinRange([0.45, DEFAULT_ERROR_MARGIN]);
        });
      });
      describe("Player played 60 minutes", () => {
        it("should decrease power approximately 60% of the time", () => {
          const map = createMap(player.instance.power - 1, player.instance.power);
          simulator.run(map, player, 60, 0);
          const powerDecreasedPercentage =
            map.get(player.instance.power - 1)! / DEFAULT_NUMBER_OF_RUNS;
          const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
          expect(powerDecreasedPercentage).toBeWithinRange([0.6, DEFAULT_ERROR_MARGIN]);
          expect(samePowerPercentage).toBeWithinRange([0.4, DEFAULT_ERROR_MARGIN]);
        });
      });
      describe("Player played 75 minutes", () => {
        it("should decrease power approximately 67% of the time", () => {
          const map = createMap(player.instance.power - 1, player.instance.power);
          simulator.run(map, player, 75, 0);
          const powerDecreasedPercentage =
            map.get(player.instance.power - 1)! / DEFAULT_NUMBER_OF_RUNS;
          const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
          expect(powerDecreasedPercentage).toBeWithinRange([0.67, DEFAULT_ERROR_MARGIN]);
          expect(samePowerPercentage).toBeWithinRange([0.33, DEFAULT_ERROR_MARGIN]);
        });
      });
      describe("Player played 90 minutes", () => {
        it("should decrease power approximately 75% of the time", () => {
          const map = createMap(player.instance.power - 1, player.instance.power);
          simulator.run(map, player, 90, 0);
          const powerDecreasedPercentage =
            map.get(player.instance.power - 1)! / DEFAULT_NUMBER_OF_RUNS;
          const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
          expect(powerDecreasedPercentage).toBeWithinRange([0.75, DEFAULT_ERROR_MARGIN]);
          expect(samePowerPercentage).toBeWithinRange([0.25, DEFAULT_ERROR_MARGIN]);
        });
      });
      describe("Player played 105 minutes", () => {
        it("should decrease power approximately 83% of the time", () => {
          const map = createMap(player.instance.power - 1, player.instance.power);
          simulator.run(map, player, 105, 0);
          const powerDecreasedPercentage =
            map.get(player.instance.power - 1)! / DEFAULT_NUMBER_OF_RUNS;
          const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
          expect(powerDecreasedPercentage).toBeWithinRange([0.83, DEFAULT_ERROR_MARGIN]);
          expect(samePowerPercentage).toBeWithinRange([0.17, DEFAULT_ERROR_MARGIN]);
        });
      });
      describe("Player played 120 minutes", () => {
        it("should decrease power approximately 90% of the time", () => {
          const map = createMap(player.instance.power - 1, player.instance.power);
          simulator.run(map, player, 120, 0);
          const powerDecreasedPercentage =
            map.get(player.instance.power - 1)! / DEFAULT_NUMBER_OF_RUNS;
          const samePowerPercentage = map.get(player.instance.power)! / DEFAULT_NUMBER_OF_RUNS;
          expect(powerDecreasedPercentage).toBeWithinRange([0.9, DEFAULT_ERROR_MARGIN]);
          expect(samePowerPercentage).toBeWithinRange([0.1, DEFAULT_ERROR_MARGIN]);
        });
      });
    });
  });
  describe("Player used, injured", () => {
    describe("1 match injury period", () => {
      it("should have a power loss normally distributed around -2", () => {
        const map = createMap(player.instance.power - 3, player.instance.power - 1);
        simulator.run(map, player, -1, 1);
        expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(player.instance.power - 2);
      });
    });
    describe("2 matches injury period", () => {
      it("should have a power loss normally distributed around -4", () => {
        const map = createMap(player.instance.power - 7, player.instance.power - 1);
        simulator.run(map, player, -1, 2);
        // TODO: create another expect to be more flexible
        // and call the current `toBeNormallyDistributed` as `toBeStrictlyNormallyDistributed`
        // expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(player.instance.power - 4);
      });
    });
    describe("3 matches injury period", () => {
      it("should have a power loss normally distributed around -6", () => {
        const map = createMap(player.instance.power - 10, player.instance.power - 2);
        simulator.run(map, player, -1, 3);
        // TODO: create another expect to be more flexible
        // and call the current `toBeNormallyDistributed` as `toBeStrictlyNormallyDistributed`
        // expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(player.instance.power - 6);
      });
    });
    describe("4 matches injury period", () => {
      it("should have a power loss normally distributed around -10", () => {
        const map = createMap(player.instance.power - 14, player.instance.power - 3);
        simulator.run(map, player, -1, 4);
        // TODO: create another expect to be more flexible
        // and call the current `toBeNormallyDistributed` as `toBeStrictlyNormallyDistributed`
        // expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(player.instance.power - 9);
      });
    });
    describe("5 matches injury period", () => {
      it("should have a power loss normally distributed around -11", () => {
        const map = createMap(player.instance.power - 17, player.instance.power - 4);
        simulator.run(map, player, -1, 5);
        // TODO: create another expect to be more flexible
        // and call the current `toBeNormallyDistributed` as `toBeStrictlyNormallyDistributed`
        // expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(player.instance.power - 11);
      });
    });
    describe("6 matches injury period", () => {
      it("should have a power loss normally distributed around -13", () => {
        const map = createMap(player.instance.power - 20, player.instance.power - 5);
        simulator.run(map, player, -1, 6);
        // TODO: create another expect to be more flexible
        // and call the current `toBeNormallyDistributed` as `toBeStrictlyNormallyDistributed`
        // expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(player.instance.power - 13);
      });
    });
    describe("7 matches injury period", () => {
      it("should have a power loss normally distributed around -15", () => {
        const map = createMap(player.instance.power - 24, player.instance.power - 6);
        simulator.run(map, player, -1, 7);
        // TODO: create another expect to be more flexible
        // and call the current `toBeNormallyDistributed` as `toBeStrictlyNormallyDistributed`
        // expect(map).toBeNormallyDistributed();
        expect(map).toHaveMode(player.instance.power - 15);
      });
    });
  });
});
