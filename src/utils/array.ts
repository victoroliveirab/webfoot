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
