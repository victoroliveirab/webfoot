import {
  MORALE_BOOST_DRAW,
  MORALE_BOOST_LOSS,
  MORALE_BOOST_WIN,
  MORALE_MAX,
  MORALE_MIN,
} from "../constants";
import MoraleChangeProcessor from "../morale-change";

describe("Morale Change Processor", () => {
  const processor = new MoraleChangeProcessor({
    moraleBoostWin: MORALE_BOOST_WIN,
    moraleBoostDraw: MORALE_BOOST_DRAW,
    moraleBoostLoss: MORALE_BOOST_LOSS,
    minMorale: MORALE_MIN,
    maxMorale: MORALE_MAX,
  });

  it("should increase morale after win", () => {
    const oldMorale = 0.6;
    const newMorale = processor.calculateNewMorale(oldMorale, "W");
    expect(newMorale).toBeGreaterThan(oldMorale);
    expect(newMorale).toBeCloseTo(0.68, 0.01);
  });
  it("should slightly decrease morale after draw", () => {
    const oldMorale = 0.6;
    const newMorale = processor.calculateNewMorale(oldMorale, "D");
    expect(newMorale).toBeLessThan(oldMorale);
    expect(newMorale).toBeCloseTo(0.57, 0.01);
  });
  it("should decrease morale after loss", () => {
    const oldMorale = 0.6;
    const newMorale = processor.calculateNewMorale(oldMorale, "L");
    expect(newMorale).toBeLessThan(oldMorale);
    expect(newMorale).toBeCloseTo(0.525, 0.01);
  });
  it("should never go lower than min morale", () => {
    const oldMorale = MORALE_MIN + 0.01;
    const newMorale = processor.calculateNewMorale(oldMorale, "L");
    expect(newMorale).toBe(MORALE_MIN);
  });
  it("should never go higher than max morale", () => {
    const oldMorale = MORALE_MAX - 0.01;
    const newMorale = processor.calculateNewMorale(oldMorale, "W");
    expect(newMorale).toBe(MORALE_MAX);
  });
});
