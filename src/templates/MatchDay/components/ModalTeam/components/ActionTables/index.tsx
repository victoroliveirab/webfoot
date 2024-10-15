import { type Accessor, createSignal } from "solid-js";

import Button from "@webfoot/components/Button";
import { type SquadRecord } from "@webfoot/core/engine/simulator";
import type { IPlayer, ITeam } from "@webfoot/core/models/types";

import Table from "./components/Table";

type Props = {
  onClickSubstitute: (playerOut: IPlayer, playerIn: IPlayer) => unknown;
  showSubstituteButton: Accessor<boolean>;
  team: Accessor<ITeam>;
  teamSquad: Accessor<SquadRecord | null>;
};

export default function ActionTables(props: Props) {
  const [leavingPlayer, setLeavingPlayer] = createSignal<IPlayer | null>(null);
  const [joiningPlayer, setJoiningPlayer] = createSignal<IPlayer | null>(null);

  const substituteButtonEnabled = () => {
    if (!leavingPlayer() || !joiningPlayer()) return false;
    const playerOut = leavingPlayer()!;
    const playerIn = joiningPlayer()!;
    if (playerOut.position === "G" && playerIn.position !== "G") return false;
    if (playerIn.position === "G" && playerOut.position !== "G") return false;
    return true;
  };

  return (
    <div class="h-full border border-black">
      <div class="grid grid-cols-2 items-center gap-8 px-4 pt-3 pb-2">
        <Table
          class="border border-black h-[220px] box-content"
          onPlayerClick={(player) => setLeavingPlayer(player)}
          players={() => props.teamSquad()?.playing ?? []}
          team={props.team}
          selectedPlayer={leavingPlayer}
        />
        <div class="flex flex-col h-full justify-between">
          <Table
            class="border border-black h-[100px] box-content"
            onPlayerClick={(player) => setJoiningPlayer(player)}
            players={() => props.teamSquad()?.bench ?? []}
            team={props.team}
            selectedPlayer={joiningPlayer}
          />
          <div class="flex justify-end pb-1">
            {props.showSubstituteButton() && (
              <Button
                class="style-98"
                disabled={!substituteButtonEnabled()}
                onClick={() => props.onClickSubstitute(leavingPlayer()!, joiningPlayer()!)}
              >
                Substituir
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
