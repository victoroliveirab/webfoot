export function randomInt(min: number, max: number) {
  const diff = max - min;
  return Math.floor(Math.random() * diff) + min;
}

export function normalRandomInt(min: number, max: number) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const phi = 2 * Math.PI * u;
  const r = Math.sqrt(-2 * Math.log(v));
  const factor = r * Math.cos(phi);
  const mean = (min + max) / 2;
  const standardDeviation = (max - min) / 6;
  const value = mean + factor * standardDeviation;
  if (value < min || value > max) return normalRandomInt(min, max);
  return Math.floor(value);
}

export function randomWeighted(minNumber: number, maxNumber: number, skewFactor: number): number {
  if (skewFactor < 0 || skewFactor > 1) {
    throw new Error("skewFactor must be between 0 and 1 (inclusive).");
  }

  const skewedValue = Math.pow(Math.random(), 1 - skewFactor);
  return Math.floor(minNumber + (skewedValue * maxNumber - minNumber));
}
