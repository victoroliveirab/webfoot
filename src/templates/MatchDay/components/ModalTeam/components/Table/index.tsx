import { type Accessor, For, type JSX } from "solid-js";

import playerSorter from "@webfoot/core/engine/sorters/player";
import type { IPlayer } from "@webfoot/core/models/types";

type Props = {
  class?: JSX.HTMLElementTags["div"]["class"];
  players: Accessor<IPlayer[]>;
};

const Table = ({ class: className, players }: Props) => {
  const sortedPlayers = () => [...players()].sort(playerSorter);
  return (
    <div role="table" class={className}>
      <For each={sortedPlayers()}>
        {(player) => (
          <div role="row" class="flex text-sm px-[1px]">
            <div class="w-6">{player.position}</div>
            <div class="flex-1 font-bold">
              {player.name}
              <span class="text-xs">{player.star ? "*" : ""}</span>
            </div>
            <div class="w-12 font-bold text-right pr-8">{player.power}</div>
          </div>
        )}
      </For>
    </div>
  );
};

export default Table;
