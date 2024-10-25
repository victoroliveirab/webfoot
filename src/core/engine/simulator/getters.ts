import { IPlayer } from "@webfoot/core/models/types";
import type Simulator from ".";

export function getFixtureOfSimulator(this: Simulator) {
  return this.fixture;
}

export function getCurrentScorelineOfSimulator(this: Simulator) {
  return this.currentScoreline;
}

export function getOccurancesOfSimulator(this: Simulator) {
  return this.occurances;
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

export function getPlayedTimeByPlayersIdsOfSimulator(homeOrAway: "away" | "home") {
  return function (this: Simulator) {
    const key = homeOrAway === "home" ? "homeSquadRecord" : "awaySquadRecord";
    const squad = this[key];
    const playedTimeByPlayerId: Record<IPlayer["id"], number> = {};
    for (const player of squad.playing) {
      playedTimeByPlayerId[player.id] = this.getPlayerPlayedTime(player.id);
    }
    for (const player of squad.bench) {
      playedTimeByPlayerId[player.id] = this.getPlayerPlayedTime(player.id);
    }
    for (const player of squad.out) {
      playedTimeByPlayerId[player.id] = this.getPlayerPlayedTime(player.id);
    }
    return playedTimeByPlayerId;
  };
}
