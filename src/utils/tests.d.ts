import "vitest";

interface CustomMatchers<R = unknown> {
  toBeNormallyDistributed: () => R;
  toHaveMode: (expected: number) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}