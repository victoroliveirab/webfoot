import type { IPlayer } from "@webfoot/core/models/types";
import { splitBy } from "@webfoot/utils/array";

import type { AITrainerParams } from ".";
import AITrainer from "./base";
import {
  getGreatestPower,
  getGreatestPowerOfEachPosition,
  getSmallestPowerOfEachPosition,
} from "../../simulator/helpers";
import {
  playerSorterByDeffensivePower,
  playerSorterByOffensivePower,
  playerSorterByPower,
} from "../../sorters/player";

export default class StandardAITrainer extends AITrainer {
  private readonly sensibleMinNumberOfPlayersPerPosition: Record<IPlayer["position"], number> = {
    G: 1,
    D: 3,
    M: 2,
    A: 1,
  };

  constructor(params: AITrainerParams) {
    super(params);
  }

  pickFixtureSquad(availablePlayers: IPlayer[]) {
    if (availablePlayers.every(({ position }) => position !== "G")) {
      // If there are no goalkeepers available, just return the best players and that's it
      availablePlayers.sort(playerSorterByPower);
      return {
        playing: availablePlayers.slice(0, 11),
        bench: availablePlayers.slice(11, 16),
      };
    }

    const playing: IPlayer[] = [];
    const bench: IPlayer[] = [];

    const [goalkeepers, linePlayers] = splitBy(
      availablePlayers,
      (player) => player.position === "G",
    );
    goalkeepers.sort(playerSorterByPower);
    playing.push(goalkeepers.shift()!);
    if (goalkeepers.length > 0) {
      bench.push(goalkeepers.shift()!);
    }

    if (linePlayers.length <= 10) {
      for (const player of linePlayers) playing.push(player);
      return {
        playing,
        bench,
      };
    }

    const playersSortedByPowerAndPosition = this.playersSortedByPowerAndPosition(linePlayers);
    for (const key of Object.keys(playersSortedByPowerAndPosition)) {
      const position = key as IPlayer["position"];
      if (position === "G") continue; // We already dealt with the goalkeepers
      const desiredNumberOfPlayers = this.sensibleMinNumberOfPlayersPerPosition[position];
      const availableNumberOfPlayers = playersSortedByPowerAndPosition[position].length;
      for (
        let count = 0;
        count < Math.min(desiredNumberOfPlayers, availableNumberOfPlayers);
        ++count
      ) {
        playing.push(playersSortedByPowerAndPosition[position].shift()!);
      }
    }

    while (playing.length < 11) {
      const bestDefender = playersSortedByPowerAndPosition.D[0];
      const bestMidfielder = playersSortedByPowerAndPosition.M[0];
      const bestAttacker = playersSortedByPowerAndPosition.A[0];
      if (
        bestDefender &&
        bestDefender.power > (bestMidfielder?.power ?? 0) &&
        bestDefender.power > (bestAttacker?.power ?? 0)
      ) {
        playing.push(bestDefender);
        playersSortedByPowerAndPosition.D.shift();
      } else if (
        bestMidfielder &&
        bestMidfielder.power >= (bestDefender?.power ?? 0) &&
        bestMidfielder.power >= (bestAttacker?.power ?? 0)
      ) {
        playing.push(bestMidfielder);
        playersSortedByPowerAndPosition.M.shift();
      } else if (
        bestAttacker &&
        bestAttacker.power >= (bestDefender?.power ?? 0) &&
        bestAttacker.power >= (bestMidfielder?.power ?? 0)
      ) {
        playing.push(bestAttacker);
        playersSortedByPowerAndPosition.A.shift();
      } else {
        // Only goalkeepers left
        break;
      }
    }

    // Try to put at least one defender on bench
    if (playersSortedByPowerAndPosition.D.length > 0)
      bench.push(playersSortedByPowerAndPosition.D.shift()!);
    // Try to put at least one midfielder on bench
    if (playersSortedByPowerAndPosition.M.length > 0)
      bench.push(playersSortedByPowerAndPosition.M.shift()!);
    // Try to put at least one attacker on bench
    if (playersSortedByPowerAndPosition.A.length > 0)
      bench.push(playersSortedByPowerAndPosition.A.shift()!);

    const unselectedPlayersLeft =
      playersSortedByPowerAndPosition.D.length +
      playersSortedByPowerAndPosition.M.length +
      playersSortedByPowerAndPosition.A.length;
    const spotsLeftOnBench = this.getters.fixture().benchSize - bench.length;

    // If there are enough spots on the bench for all players left, just put them in
    if (spotsLeftOnBench >= unselectedPlayersLeft) {
      while (playersSortedByPowerAndPosition.G[0])
        bench.push(playersSortedByPowerAndPosition.G.shift()!);
      while (playersSortedByPowerAndPosition.D[0])
        bench.push(playersSortedByPowerAndPosition.D.shift()!);
      while (playersSortedByPowerAndPosition.M[0])
        bench.push(playersSortedByPowerAndPosition.M.shift()!);
      while (playersSortedByPowerAndPosition.A[0])
        bench.push(playersSortedByPowerAndPosition.A.shift()!);
      return {
        playing,
        bench,
      };
    }

    // There are more players available than bench spots
    while (bench.length < this.getters.fixture().benchSize) {
      const bestGoalkeeper = playersSortedByPowerAndPosition.G[0];
      const bestDefender = playersSortedByPowerAndPosition.D[0];
      const bestMidfielder = playersSortedByPowerAndPosition.M[0];
      const bestAttacker = playersSortedByPowerAndPosition.A[0];
      if (!bestDefender && !bestMidfielder && !bestAttacker) {
        if (bestGoalkeeper) {
          bench.push(bestGoalkeeper);
          playersSortedByPowerAndPosition.G.shift();
        }
        break;
      }
      if (
        bestDefender &&
        bestDefender.power > (bestMidfielder?.power ?? 0) &&
        bestDefender.power > (bestAttacker?.power ?? 0)
      ) {
        bench.push(bestDefender);
        playersSortedByPowerAndPosition.D.shift();
      } else if (
        bestMidfielder &&
        bestMidfielder.power >= (bestDefender?.power ?? 0) &&
        bestMidfielder.power >= (bestAttacker?.power ?? 0)
      ) {
        bench.push(bestMidfielder);
        playersSortedByPowerAndPosition.M.shift();
      } else {
        bench.push(bestAttacker);
        playersSortedByPowerAndPosition.A.shift();
      }
    }

    return {
      playing,
      bench,
    };
  }

  decideSubstitutionPostInjury(injuredPlayer: IPlayer) {
    const { bench } = this.getters.squad();
    const bestSubs = bench.filter(({ position }) => position === injuredPlayer.position);
    if (bestSubs.length > 0) {
      return bestSubs.reduce((bestSub, player) =>
        bestSub.power > player.power ? bestSub : player,
      );
    }
    const bestBenched = getGreatestPowerOfEachPosition(bench);
    // No player from the same position
    if (injuredPlayer.position === "G") {
      // If the injuried player is a GK and there's no GK available
      // Use the most defensive player we can find
      return bestBenched.D || bestBenched.M || bestBenched.A!;
    }

    if (this.isTeamWinning()) {
      // If it's winning, better put the most defensive player to play
      return bestBenched.D || bestBenched.M || bestBenched.A;
    } else if (this.isTeamLosing()) {
      // If it's losing, better put the most offensive player to play
      return bestBenched.A || bestBenched.M || bestBenched.D;
    }

    // If it's drawing, just put the best player
    return getGreatestPower(bench.filter(({ position }) => position !== "G"));
  }

  decideSubstitutionPostRedcard(sentOffPlayer: IPlayer) {
    const { bench, playing } = this.getters.squad();
    const wasGKSentOff = sentOffPlayer.position === "G";
    if (wasGKSentOff) {
      const subGK = getGreatestPower(bench.filter(({ position }) => position === "G"));
      // A GK was sent off, and we have a GK available to enter
      if (subGK) {
        // If team is losing, we want to remove the worst non-attacking player to put the new GK
        // If team is winning/drawing, we want to remove the worst non-defending player to put the new GK
        const playingSquad = playing
          .filter(({ id }) => id !== sentOffPlayer.id)
          .toSorted(
            this.isTeamLosing() ? playerSorterByDeffensivePower : playerSorterByOffensivePower,
          );
        let index = 1;
        while (
          index < playingSquad.length &&
          playingSquad[index].position === playingSquad[index - 1].position
        )
          ++index;
        return {
          playerIn: subGK,
          playerOut: playingSquad[index - 1],
        };
      } else {
        // A GK was sent off, but we don't have any GK available to enter
        // Better strategies should implement something to this
        return null;
      }
    }

    const playingSquad = playing.filter(({ id }) => id !== sentOffPlayer.id);
    const worstPlayingPlayers = getSmallestPowerOfEachPosition(playingSquad);
    const bestBenchedPlayers = getGreatestPowerOfEachPosition(bench);
    // Player sent off was not a GK
    if (this.isTeamLosing()) {
      // If team is losing, we want to remove the worst defensive player and put the best offensive
      // NOTE: this is far from perfect (e.g. if we have A power 1 on bench and M power 50
      // and we want to try to swap with D of power 10, the comparison will happen to A, even though
      // the best move is to place M 50 on D 10)
      // But this is fine for the standard (average) trainer
      const playerOut = worstPlayingPlayers.D || worstPlayingPlayers.M || worstPlayingPlayers.A!;
      const playerIn = bestBenchedPlayers.A || bestBenchedPlayers.M || bestBenchedPlayers.D;
      return playerIn && playerIn.power >= playerOut.power
        ? {
            playerOut,
            playerIn,
          }
        : null;
    }

    // If team is winning/drawing, we want to remove the worst attakcing player and put the best deffensive
    // NOTE: Like the previous note
    const playerOut = worstPlayingPlayers.A || worstPlayingPlayers.M || worstPlayingPlayers.D!;
    const playerIn = bestBenchedPlayers.D || bestBenchedPlayers.M || bestBenchedPlayers.A;
    return playerIn && playerIn.power >= playerOut.power
      ? {
          playerOut,
          playerIn,
        }
      : null;
  }
}
