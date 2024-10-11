import type { IPlayer } from "@webfoot/core/models/types";
import { randomInt } from "@webfoot/utils/math";

import { playerSorterByPower } from "../sorters/player";

export function pickSquadRandomly(players: IPlayer[]) {
  const squad = new Set<number>();
  while (squad.size < 10) {
    const playerIndex = randomInt(0, players.length);
    if (players[playerIndex].position !== "G") squad.add(playerIndex);
  }
  while (squad.size < 11) {
    const playerIndex = randomInt(0, players.length);
    if (players[playerIndex].position === "G") squad.add(playerIndex);
  }

  const selectedPlayers: IPlayer[] = Array.from(squad.values()).reduce(
    (acc: IPlayer[], playerIndex) => [...acc, players[playerIndex]],
    [],
  );

  // TODO: make this smarter, please
  const subs = new Set<number>();
  let tries = 0;
  while (tries < 50 && subs.size < 5) {
    const playerIndex = randomInt(0, players.length);
    if (!squad.has(playerIndex)) subs.add(playerIndex);
    ++tries;
  }

  const selectedSubs: IPlayer[] = Array.from(subs.values()).reduce(
    (acc: IPlayer[], playerIndex) => [...acc, players[playerIndex]],
    [],
  );

  return {
    firstTeam: selectedPlayers,
    substitutes: selectedSubs,
  };
}

export function pickBestAvailable(players: IPlayer[]) {
  if (players.length <= 11)
    return {
      firstTeam: players,
      substitutes: [],
    };

  let bestGK: IPlayer | null = null;
  for (const gk of players.filter(({ position }) => position === "G")) {
    if (!bestGK || gk.power > bestGK.power) {
      bestGK = gk;
    } else if (gk.power === bestGK.power) {
      const random = Math.random();
      if (random > 0.5) bestGK = gk;
    }
  }

  const fieldPlayers = players.filter(({ position }) => position !== "G");
  fieldPlayers.sort(playerSorterByPower);
  if (bestGK) {
    return {
      firstTeam: [bestGK, ...fieldPlayers.slice(0, 10)],
      substitutes: fieldPlayers.slice(10, 15),
    };
  }
  return {
    firstTeam: fieldPlayers.slice(0, 11),
    substitutes: fieldPlayers.slice(11, 16),
  };
}

/**
 * FIXME: this function always assumes there are at least 16 available players
 */
export function pickSquadByFormation(
  players: IPlayer[],
  formation: string | Record<IPlayer["position"], number>,
) {
  const playersNeededByPosition: Record<IPlayer["position"], number> = (() => {
    if (typeof formation === "string") {
      const [dQuantity, mQuantity, aQuantity] = formation.split("-").map(Number);
      return {
        G: 1,
        D: dQuantity,
        M: mQuantity,
        A: aQuantity,
      };
    }
    return formation;
  })();
  const squad = new Set<number>();
  for (const position of Object.keys(playersNeededByPosition)) {
    let playersNeededLeft = playersNeededByPosition[position as IPlayer["position"]];
    const playersToPick = players.filter(
      (player) => player.position === position && player.suspensionPeriod === 0,
    );
    while (playersNeededLeft > 0) {
      const setSizeBefore = squad.size;
      squad.add(playersToPick[randomInt(0, playersToPick.length)].id);
      if (squad.size > setSizeBefore) --playersNeededLeft;
    }
  }
  const firstTeam: IPlayer[] = Array.from(squad.values()).map(
    (id) => players.find(({ id: playerId }) => playerId === id)!,
  );
  const substitutes: IPlayer[] = [];
  while (substitutes.length < 5) {
    const playerIndex = randomInt(0, players.length);
    const player = players[playerIndex];
    if (!squad.has(player.id)) {
      squad.add(player.id);
      substitutes.push(player);
    }
  }
  return {
    firstTeam,
    substitutes,
  };
}
