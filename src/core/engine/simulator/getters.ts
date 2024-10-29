import type Simulator from ".";

export function getFixtureOfSimulator(this: Simulator) {
  return this.fixture;
}

export function getCurrentScorelineOfSimulator(this: Simulator) {
  return this.currentScoreline;
}

export function getSquadOfSimulator(homeOrAway: "away" | "home") {
  return function (this: Simulator) {
    const key = homeOrAway === "home" ? "homeSquadRecord" : "awaySquadRecord";
    return this[key];
  };
}

export function getSubsLeftOfSimulator(homeOrAway: "away" | "home") {
  return function (this: Simulator) {
    const key = homeOrAway === "home" ? "homeSubsLeft" : "awaySubsLeft";
    return this[key];
  };
}
