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
      expect(randomNumbers).toBeNormallyDistributed();
      expect(randomNumbers).toHaveMode(0);
    });
    it("should generate random integers in a normal distribution between 2 integers assimetric", () => {
      const min = -2;
      const max = 4;
      const randomNumbers = generateRandoms(min, max, 50000, normalRandomInt);
      expect(randomNumbers).toBeNormallyDistributed();
      expect(randomNumbers).toHaveMode(0.5);
    });
  });
});
