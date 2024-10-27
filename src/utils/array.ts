import { randomInt } from "./math";

/**
 * Shuffle an array using Fisher-Yates algorithm
 * NOTE: this does not shuffle in place
 */
export function shuffle<T>(array: T[]) {
  let currentIndex = array.length;
  const shuffledArray = [...array];
  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[currentIndex],
    ];
  }
  return shuffledArray;
}

/**
 *
 */
export function arrayToHashMap<T extends { id: number }>(array: T[]) {
  return array.reduce(
    (acc, el) => ({
      ...acc,
      [el.id]: el,
    }),
    {} as Record<T["id"], T>,
  );
}

export function pickRandom<T>(array: T[]) {
  return array[randomInt(0, array.length)];
}

export function splitBy<T>(array: T[], predicate: (value: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  for (let i = 0; i < array.length; ++i) {
    if (predicate(array[i])) {
      truthy.push(array[i]);
    } else {
      falsy.push(array[i]);
    }
  }
  return [truthy, falsy];
}

export function groupBy<T, K extends PropertyKey = keyof T>(
  array: T[],
  keyCalculator: (value: T) => K,
) {
  const object = {} as { [key in K]: T[] };
  for (let i = 0; i < array.length; ++i) {
    const key = keyCalculator(array[i]);
    if (!object[key]) object[key] = [];
    object[key].push(array[i]);
  }
  return object;
}
