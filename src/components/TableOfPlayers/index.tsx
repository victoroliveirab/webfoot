import { type Accessor, For, createSignal } from "solid-js";

import type { Color } from "@webfoot/core/db/types";
import type { IPlayer } from "@webfoot/core/models/types";
import type { ArrayOfField } from "@webfoot/utils/types";

import DivInTeamColors from "../DivInTeamColors";

type DashboardSquad = {
  firstTeam: IPlayer[];
  substitutes: IPlayer[];
};

type Props = {
  background: Color;
  class?: string;
  foreground: Color;
  onClickPlayer?: (id: number) => void;
  onSelectPlayer?: (id: number) => void;
  players: IPlayer[];
  selectedPlayers?: Accessor<DashboardSquad> | Accessor<ArrayOfField<DashboardSquad, "id">>;
  withDividers?: boolean;
};

function isSelectedPlayerIdsOnly(
  selectedPlayers: DashboardSquad | ArrayOfField<DashboardSquad, "id">,
): selectedPlayers is ArrayOfField<DashboardSquad, "id"> {
  return typeof selectedPlayers.firstTeam[0] === "number";
}

function renderIndicator(
  player: Props["players"][number],
  selectedPlayers?: Props["selectedPlayers"],
) {
  if (!selectedPlayers) return null;
  const players = selectedPlayers();
  if (isSelectedPlayerIdsOnly(players)) {
    if (players.firstTeam.includes(player.id)) return <span class="text-xs">&#9679;</span>;
    if (players.substitutes.includes(player.id)) return <span class="text-xs">-</span>;
  } else {
    if (players.firstTeam.some(({ id }) => id === player.id))
      return <span class="text-xs">&#9679;</span>;
    if (players.substitutes.some(({ id }) => id === player.id))
      return <span class="text-xs">-</span>;
  }
  return null;
}

export default function TableOfPlayers({
  background,
  class: className,
  foreground,
  onClickPlayer,
  onSelectPlayer,
  players,
  selectedPlayers,
  withDividers = false,
}: Props) {
  const [selectedRow, setSelectedRow] = createSignal<number | null>(null);

  return (
    <div role="table" class={className} style={{ background: foreground }}>
      <For each={players}>
        {(player, index) => (
          <>
            {withDividers &&
            index() > 0 &&
            players[index()].position !== players[index() - 1].position ? (
              <hr class="border-top" style={{ "border-color": background }} />
            ) : null}
            <DivInTeamColors
              role="row"
              class="flex border border-dotted select-none font-bold text-sm"
              background={foreground}
              foreground={background}
              selected={() => selectedRow() === index()}
              onClick={() => {
                setSelectedRow(index);
                onClickPlayer?.(player.id);
              }}
            >
              <div
                role="cell"
                class="w-6 text-center flex items-center pl-px"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedRow(index);
                  onSelectPlayer?.(player.id);
                }}
              >
                {renderIndicator(player, selectedPlayers)}
              </div>
              <div role="cell" class="w-6">
                {player.position}
              </div>
              <div role="cell" class="w-48 gap-2">
                <span>
                  {player.name}
                  <span class="text-xs">{player.star ? "*" : ""}</span>
                </span>
              </div>
              <div role="cell" class="flex-1 flex gap-3">
                <span>{player.power}</span>
                <span>{player.suspensionPeriod > 0 ? "S" : ""}</span>
              </div>
              <div role="cell" class="w-10 text-right">
                {player.salary}
              </div>
              <div role="cell" class="w-10">
                {player.available ? "" : "+"}
              </div>
            </DivInTeamColors>
          </>
        )}
      </For>
    </div>
  );
}
