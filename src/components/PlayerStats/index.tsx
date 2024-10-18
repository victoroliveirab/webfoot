import { type Accessor } from "solid-js";

import type { IPlayer, ITeam } from "@webfoot/core/models/types";
import { DISCIPLINES_MAP } from "@webfoot/core/db/constants";

type Props = {
  player: Accessor<IPlayer> | Accessor<IPlayer | null>;
  team: Accessor<ITeam> | Accessor<ITeam | null>;
};

export default function PlayerStats({ player, team }: Props) {
  return (
    <>
      <p class="flex gap-6 mb-4">
        Comportamento <span>{player() ? DISCIPLINES_MAP[player()!.discipline] : null}</span>
      </p>
      <p class="flex gap-6">
        Golos esta época <span>{player()?.stats.seasonGoals}</span>
      </p>
      <div class="border border-w3c-lightgray mt-6 px-3 pb-3">
        <h4 class="-mt-3 w-fit" style={{ "background-color": team()?.background }}>
          Historial
        </h4>
        <div role="row" class="field-row flex justify-between">
          <span>Jogos</span>
          <span>{player()?.stats.games}</span>
        </div>
        <div role="row" class="field-row flex justify-between">
          <span>Golos</span>
          <span>{player()?.stats.goals}</span>
        </div>
        <div role="row" class="field-row flex justify-between">
          <span>Cartões vermelhos</span>
          <span>{player()?.stats.redcards}</span>
        </div>
        <div role="row" class="field-row flex justify-between">
          <span>Lesões</span>
          <span>{player()?.stats.injuries}</span>
        </div>
      </div>
      {player() && player()!.suspensionPeriod > 0 && (
        <p class="font-bold italic text-xs mt-2">
          {`Suspenso por ${player()!.suspensionPeriod} ${player()!.suspensionPeriod === 1 ? "jogo" : "jogos"}`}
        </p>
      )}
      {player() && player()!.injuryPeriod > 0 && (
        <p class="font-bold italic text-xs mt-2">
          {`Lesionado por ${player()!.injuryPeriod} ${player()!.injuryPeriod === 1 ? "jogo" : "jogos"}`}
        </p>
      )}
    </>
  );
}
