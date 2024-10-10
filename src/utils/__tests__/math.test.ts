import { normalRandomInt, randomInt } from "../math";

function generateRandoms(
  min: number,
  max: number,
  quantity: number,
  generator: (a: number, b: number) => number,
) {
  const map = new Map<number, number>();
  for (let i = min; i < max; ++i) map.set(i, 0);
  for (let i = 0; i < quantity; ++i) {
    const value = generator(min, max);
    map.set(value, map.get(value)! + 1);
  }
  return map;
}

describe("math", () => {
  describe("randomInt", () => {
    it("should generate random integers between 2 integers", () => {
      const min = -2;
      const max = 3;
      const randomNumbers = generateRandoms(min, max, 50000, randomInt);
      for (let i = min; i < max; ++i) {
        expect(randomNumbers.get(i)).toBeGreaterThan(0);
      }
      expect(randomNumbers.has(max)).toBeFalsy();
    });
  });

  describe("normalRandomInt", () => {
    it("should generate random integers in a normal distribution between 2 integers", () => {
      const min = -2;
      const max = 3;
      const randomNumbers = generateRandoms(min, max, 50000, normalRandomInt);
      const mode = randomNumbers.get(0)!;
      const secondMode1 = randomNumbers.get(-1)!;
      const secondMode2 = randomNumbers.get(1)!;
      const leastCommon1 = randomNumbers.get(-2)!;
      const leastCommon2 = randomNumbers.get(2)!;
      expect(mode).toBeGreaterThan(secondMode1);
      expect(mode).toBeGreaterThan(secondMode2);
      expect(secondMode1).toBeGreaterThan(leastCommon1);
      expect(secondMode1).toBeGreaterThan(leastCommon2);
      expect(secondMode2).toBeGreaterThan(leastCommon1);
      expect(secondMode2).toBeGreaterThan(leastCommon2);
    });
  });
});
