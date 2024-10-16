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
  isDashboard?: boolean;
  onClickPlayer?: (id: number) => void;
  onSelectPlayer?: (id: number) => void;
  players: IPlayer[];
  selectedPlayers?: Accessor<DashboardSquad> | Accessor<ArrayOfField<DashboardSquad, "id">>;
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
  isDashboard = false,
  foreground,
  onClickPlayer,
  onSelectPlayer,
  players,
  selectedPlayers,
}: Props) {
  const [selectedRow, setSelectedRow] = createSignal<number | null>(null);

  return (
    <div role="table" class={className} style={{ background: foreground }}>
      <For each={players}>
        {(player, index) => (
          <>
            {isDashboard &&
            index() > 0 &&
            players[index()].position !== players[index() - 1].position ? (
              <hr class="border-top" style={{ "border-color": background }} />
            ) : null}
            <DivInTeamColors
              role="row"
              class="flex border border-dotted select-none font-bold"
              background={foreground}
              foreground={background}
              selected={() => selectedRow() === index()}
              onClick={() => {
                setSelectedRow(index);
                onClickPlayer?.(player.id);
              }}
            >
              {isDashboard && (
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
              )}
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
              {isDashboard && (
                <div role="cell" class="w-10 text-right">
                  {player.salary}
                </div>
              )}
              {isDashboard && (
                <div role="cell" class="w-10">
                  {player.available ? "" : "+"}
                </div>
              )}
            </DivInTeamColors>
          </>
        )}
      </For>
    </div>
  );
}
