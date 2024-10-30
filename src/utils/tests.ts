function stringifyMap(map: Map<number, number>) {
  let lines: string[] = [];
  for (const [key, value] of map.entries()) {
    lines.push(`${key} => ${value}`);
  }
  return lines.join("\n");
}

expect.extend({
  toBeNormallyDistributed(received: Map<number, number>) {
    const keys = Array.from(received.keys());
    const min = Math.min(...keys);
    const max = Math.max(...keys);
    const mid = min + (max - min) / 2;
    let direction = 1; // 0 = decreasing, 1 = increasing
    let prev = received.get(min);
    let holeInMap = false;
    let changedDirectionTimes = 0;
    for (let i = min + 1; i <= max; ++i) {
      if (changedDirectionTimes > 1) break;
      const curr = received.get(i);
      if (prev === undefined || curr === undefined) {
        holeInMap = true;
        break;
      }
      if (direction === 1) {
        if (prev > curr) {
          direction = 0;
          ++changedDirectionTimes;
        }
      } else {
        if (prev < curr) {
          direction = 1;
          ++changedDirectionTimes;
        }
      }
      prev = curr;
    }
    let normalDistributed = true;
    const isSymmetric = Math.abs(mid - Math.floor(mid)) < 0.01;
    if (isSymmetric) {
      let leftKey = mid - 1;
      let rightKey = mid + 1;
      let prevLeftValue = received.get(mid);
      let prevRightValue = prevLeftValue;
      while (leftKey >= min) {
        const currLeftValue = received.get(leftKey);
        const currRightValue = received.get(rightKey);
        if (
          prevLeftValue === undefined ||
          prevRightValue === undefined ||
          currLeftValue === undefined ||
          currRightValue === undefined
        ) {
          normalDistributed = false;
          break;
        }
        if (currLeftValue > prevLeftValue || currRightValue > prevRightValue) {
          normalDistributed = false;
          break;
        }
        --leftKey;
        ++rightKey;
        prevLeftValue = currLeftValue;
        prevRightValue = currRightValue;
      }
    }
    return {
      pass: !holeInMap && changedDirectionTimes === 1 && normalDistributed,
      message: () =>
        `Expected the following map to have a normal distribution:\n\n${stringifyMap(received)}\n`,
    };
  },
  toHaveMode(received: Map<number, number>, expected: number) {
    const multipleModes = Math.abs(expected - Math.floor(expected)) > 0.01;
    if (multipleModes) {
      const k1 = Math.floor(expected);
      const k2 = Math.ceil(expected);
      const v1 = received.get(k1) ?? 0;
      const v2 = received.get(k2) ?? 0;
      const [mostFrequent, secondMostFrequent] = v1 > v2 ? [v1, v2] : [v2, v1];
      for (const key of received.keys()) {
        if (key === k1 || key === k2) continue;
        const value = received.get(key);
        if (!value) continue;
        if (value === secondMostFrequent || value === mostFrequent) {
          return {
            pass: false,
            message: () => `Expected the modes to be ${k1} and ${k2}, but ${key} also is mode`,
          };
        }
        if (value > secondMostFrequent) {
          return {
            pass: false as const,
            message: () =>
              `Expected the modes to be ${k1} and ${k2}, but ${key} appears more (${value}) than ${k2} (${secondMostFrequent})`,
          };
        }
      }
      return {
        pass: true,
        message: () => "",
      };
    } else {
      const frequency = received.get(expected);
      if (!frequency) {
        return {
          pass: false,
          message: () => `${expected} cannot be a mode since it doesn't appear on map`,
        };
      }
      for (const key of received.keys()) {
        if (key === expected) continue;
        const value = received.get(key);
        if (!value) continue;
        if (value === frequency) {
          return {
            pass: false,
            message: () =>
              `Expected to have single mode ${expected} (${frequency}), but ${key} has the same frequency`,
          };
        }
        if (value > frequency) {
          return {
            pass: false,
            message: () =>
              `Expected ${expected} (${frequency}) to be mode, but ${key} (${value}) is more frequent. \n\n${stringifyMap(received)}\n`,
          };
        }
      }
    }
    return {
      pass: true,
      message: () => "",
    };
  },
  toBeWithinRange(received: number, expected: [number, number]) {
    const [target, range] = expected;
    const minValue = target - range;
    const maxValue = target + range;
    return {
      pass: received >= minValue && received <= maxValue,
      message: () =>
        `Expected ${received} to be between ${minValue} and ${maxValue} (${target} +/- ${range})`,
    };
  },
});
