import { Show, useContext } from "solid-js";

import { DISCIPLINES_MAP } from "@webfoot/core/db/constants";

import { ClubContext } from "../../../contexts/club";
import { LayoutContext } from "../../../contexts/layout";

const PlayerTab = () => {
  const club = useContext(ClubContext);
  const {
    values: { visiblePlayer: player },
  } = useContext(LayoutContext);

  return (
    <div class="flex-1 flex flex-col px-4 pt-2">
      <Show when={!!player()}>
        <h2 class="text-xl relative">
          <span>{player()!.name}</span>
          <span class="text-xs absolute top-1">{player()!.star ? "*" : ""}</span>
        </h2>
        <div class="flex items-center gap-3">
          <img src="/src/assets/flags/BRA.BMP" class="w-10 h-auto" />
          <h3>Brasil</h3>
        </div>
        <div class="flex-1 flex flex-col mt-12 justify-between text-sm">
          <div class="pl-6 pr-10">
            <p class="flex gap-6 mb-4">
              Comportamento <span>{DISCIPLINES_MAP[player()!.discipline]}</span>
            </p>
            <p class="flex gap-6">
              Golos esta época <span>{player()!.stats.seasonGoals}</span>
            </p>
            <div class="border border-w3c-lightgray mt-6 px-3 pb-3">
              <h4 class="-mt-3 w-fit" style={{ "background-color": club().team!.background }}>
                Historial
              </h4>
              <div role="row" class="field-row flex justify-between">
                <span>Jogos</span>
                <span>{player()!.stats.games}</span>
              </div>
              <div role="row" class="field-row flex justify-between">
                <span>Golos</span>
                <span>{player()!.stats.goals}</span>
              </div>
              <div role="row" class="field-row flex justify-between">
                <span>Cartões vermelhos</span>
                <span>{player()!.stats.redcards}</span>
              </div>
              <div role="row" class="field-row flex justify-between">
                <span>Lesões</span>
                <span>{player()!.stats.injuries}</span>
              </div>
            </div>
          </div>
          <div>
            {player()!.suspensionPeriod > 0 && (
              <span class="font-bold italic text-xs">
                {`Suspenso por ${player()!.suspensionPeriod} ${player()!.suspensionPeriod === 1 ? "jogo" : "jogos"}`}
              </span>
            )}
          </div>
          <Show when={player()!.available}>
            <button class="style-98 default w-48 h-8 !text-base mx-auto mb-4">
              Renovar contrato...
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default PlayerTab;
