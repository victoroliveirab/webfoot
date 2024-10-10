import { describeNumberMoney } from "../number";

describe("number", () => {
  describe("describeNumberMoney", () => {
    it.each([-1, -23, -456, -7890])(
      "should just append currency to negative number: %i",
      (value) => {
        const description = describeNumberMoney(value);
        expect(description).toBe(`${value} reais`);
      },
    );

    it.each([0, -0, "0", "-0"])("should just return 0 reais to zero number: %i", (value) => {
      const description = describeNumberMoney(value);
      expect(description).toBe("0 reais");
    });

    it.each([1, "1"])("should return singular variant to number-like 1", (value) => {
      const description = describeNumberMoney(value);
      expect(description).toBe("1 real");
    });

    it.each([2, 34, 456])(
      "should just append currency to positive number less than 1,000: %i",
      (value) => {
        const description = describeNumberMoney(value);
        expect(description).toBe(`${value} reais`);
      },
    );

    it.each([
      [1000, "1 mil reais", "1 mil reais"],
      [1001, "1 mil reais", "1 mil e 1 reais"],
      [2003, "2 mil reais", "2 mil e 3 reais"],
      [3004, "3 mil reais", "3 mil e 4 reais"],
      [5067, "5 mil reais", "5 mil e 67 reais"],
      [8900, "8 mil reais", "8 mil e 900 reais"],
      [10_000, "10 mil reais", "10 mil reais"],
      [14_567, "14 mil reais", "14 mil e 567 reais"],
      [200_000, "200 mil reais", "200 mil reais"],
      [567_890, "567 mil reais", "567 mil e 890 reais"],
    ])(
      "should format correctly numbers larger than 1,000 and smaller than 1,000,000: %i",
      (value, expectedSummarize, expectedComplete) => {
        const summarizedDescription = describeNumberMoney(value);
        const completeDescription = describeNumberMoney(value, true);
        expect(summarizedDescription).toBe(expectedSummarize);
        expect(completeDescription).toBe(expectedComplete);
      },
    );

    it.each([
      [1_000_000, "1 milhão de reais", "1 milhão de reais"],
      [1_000_001, "1 milhão de reais", "1 milhão e 1 reais"],
      [2_345_678, "2 milhões e 345 mil reais", "2 milhões, 345 mil e 678 reais"],
      [15_678_901, "15 milhões e 678 mil reais", "15 milhões, 678 mil e 901 reais"],
      [16_000_000, "16 milhões de reais", "16 milhões de reais"],
      [18_001_000, "18 milhões e 1 mil reais", "18 milhões e 1 mil reais"],
      [23_456_000, "23 milhões e 456 mil reais", "23 milhões e 456 mil reais"],
    ])(
      "should format correctly numbers larger than 1,000,000: %i",
      (value, expectedSummarize, expectedComplete) => {
        const summarizedDescription = describeNumberMoney(value);
        const completeDescription = describeNumberMoney(value, true);
        expect(summarizedDescription).toBe(expectedSummarize);
        expect(completeDescription).toBe(expectedComplete);
      },
    );
  });
});
