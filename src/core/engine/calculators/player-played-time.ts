import type { IPlayer } from "@webfoot/core/models/types";

import Simulator from "../simulator";

export function calculatePlayerPlayedTime(simulation: Simulator, player: IPlayer) {
  const squadRecord =
    player.teamId === simulation.fixture.homeId ? simulation.squads.home : simulation.squads.away;
  // Player started on the bench and sat there the whole match
  if (squadRecord.bench.find(({ id }) => id === player.id)) return 0;

  const playerFinishedMatchPlaying = squadRecord.playing.find(({ id }) => id === player.id);
  const playerFinishedMatchOut = squadRecord.out.find(({ id }) => id === player.id);

  // Player was not selected to go to match
  if (!playerFinishedMatchPlaying && !playerFinishedMatchOut) return 0;

  // Player finished match playing in the following scenarios:
  // 1. He started and finished playing
  // 2. He came out the bench and finished playing
  if (playerFinishedMatchPlaying) {
    const cameInTime =
      simulation.occurances.find(
        ({ type, playerId }) => type === "SUBSTITUTION" && playerId === player.id,
      )?.time ?? 0;
    return simulation.playedTime - cameInTime;
  }

  // Player finished match out in the following scenarios:
  // 1. He started the match but got subbed along the way
  // 2. He came out the bench and got subbed (poor guy)
  let cameInTime = 0;
  for (const occurance of simulation.occurances) {
    if (occurance.type !== "SUBSTITUTION") continue;
    const { playerId, subbedPlayerId, time } = occurance;
    if (playerId === player.id) {
      cameInTime = time;
    } else if (subbedPlayerId === player.id) {
      return time - cameInTime;
    }
  }

  // Player finished match out in the following scenarios:
  // 1. He started the match but got sent off along the way
  // 2. He came out the bench and got sent off along the way
  for (const occurance of simulation.occurances) {
    if (occurance.type !== "REDCARD") continue;
    const { playerId, time } = occurance;
    if (playerId === player.id) {
      return time - cameInTime;
    }
  }

  // Player finished match out in the following scenarios:
  // 1. He started the match, got injured, but no player subbed him (team stayed w/ 1 less)
  // 2. He came out the bench, got injured, but no player subbed him (team stayed w/ 1 less)
  for (const occurance of simulation.occurances) {
    if (occurance.type !== "INJURY") continue;
    const { playerId, time } = occurance;
    if (playerId === player.id) {
      return time - cameInTime;
    }
  }

  console.error({ simulation, player });
  throw new Error("This should be unreached");
}
