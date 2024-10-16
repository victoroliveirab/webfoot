import { Show, useContext } from "solid-js";

import PlayerStats from "@webfoot/components/PlayerStats";

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
            <PlayerStats player={player} team={() => club().team} />
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
