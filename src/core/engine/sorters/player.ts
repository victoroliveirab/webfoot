import type { IPlayer } from "@webfoot/core/models/types";

function getPlayerPositionSortValue(player: IPlayer) {
  if (player.position === "G") return 3;
  if (player.position === "D") return 2;
  if (player.position === "M") return 1;
  return 0;
}

export function playerSorterByPower(playerA: IPlayer, playerB: IPlayer) {
  if (playerA.power === playerB.power) {
    return playerSorter(playerA, playerB);
  }
  return playerA.power < playerB.power ? 1 : -1;
}

export function playerSorterByOffensivePower(playerA: IPlayer, playerB: IPlayer) {
  if (playerA.position !== playerB.position) {
    const playerAPositionValue = getPlayerPositionSortValue(playerA);
    const playerBPositionValue = getPlayerPositionSortValue(playerB);
    // Attackers should come first and GK last
    return playerAPositionValue < playerBPositionValue ? -1 : 1;
  }
  return playerSorterByPower(playerA, playerB);
}

export function playerSorterByGoalsThisSeason(playerA: IPlayer, playerB: IPlayer) {
  const playerAGoals = playerA.stats.seasonGoals;
  const playerBGoals = playerB.stats.seasonGoals;
  if (playerAGoals === playerBGoals) {
    const playerAGames = playerA.stats.games;
    const playerBGames = playerB.stats.games;
    return playerAGames < playerBGames ? 1 : -1;
  }
  return playerAGoals < playerBGoals ? 1 : -1;
}

export function playerSorterByGoalsScoredAllTime(playerA: IPlayer, playerB: IPlayer) {
  const playerAGoals = playerA.stats.goals;
  const playerBGoals = playerB.stats.goals;
  // TODO: take into consideration less red cards if the same number of games as well
  if (playerAGoals === playerBGoals) {
    const playerAGames = playerA.stats.games;
    const playerBGames = playerB.stats.games;
    return playerAGames < playerBGames ? 1 : -1;
  }
  return playerAGoals < playerBGoals ? 1 : -1;
}

export default function playerSorter(playerA: IPlayer, playerB: IPlayer) {
  if (playerA.position !== playerB.position) {
    const playerAPositionValue = getPlayerPositionSortValue(playerA);
    const playerBPositionValue = getPlayerPositionSortValue(playerB);
    return playerAPositionValue < playerBPositionValue ? 1 : -1;
  }
  return playerA.name > playerB.name ? 1 : -1;
}
