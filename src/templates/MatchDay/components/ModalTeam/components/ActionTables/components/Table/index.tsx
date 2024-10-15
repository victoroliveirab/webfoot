import { type Accessor, For, type JSX } from "solid-js";

import DivInTeamColors from "@webfoot/components/DivInTeamColors";
import playerSorter from "@webfoot/core/engine/sorters/player";
import type { IPlayer, ITeam } from "@webfoot/core/models/types";

type Props = {
  class?: JSX.HTMLElementTags["div"]["class"];
  onPlayerClick: (player: IPlayer) => unknown;
  players: Accessor<IPlayer[]>;
  selectedPlayer: Accessor<IPlayer | null>;
  team: Accessor<ITeam>;
};

const Table = ({ class: className, onPlayerClick, players, selectedPlayer, team }: Props) => {
  const sortedPlayers = () => [...players()].sort(playerSorter);
  return (
    <div role="table" class={className}>
      <For each={sortedPlayers()}>
        {(player) => (
          <DivInTeamColors
            role="row"
            class="flex text-sm px-px"
            onClick={() => onPlayerClick(player)}
            background={team().background}
            foreground={team().foreground}
            selected={() => selectedPlayer()?.id === player.id}
          >
            <div class="w-6">{player.position}</div>
            <div class="flex-1 font-bold">
              {player.name}
              <span class="text-xs">{player.star ? "*" : ""}</span>
            </div>
            <div class="w-12 font-bold text-right pr-8">{player.power}</div>
          </DivInTeamColors>
        )}
      </For>
    </div>
  );
};

export default Table;
