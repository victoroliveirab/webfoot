import { useContext, type Accessor, Show, For, createSignal } from "solid-js";

import Button from "@webfoot/components/Button";
import DivInTeamColors from "@webfoot/components/DivInTeamColors";
import Frame from "@webfoot/components/Frame";
import Layout from "@webfoot/components/Layout";
import Modal from "@webfoot/components/Modal";
import { PLAYER_POSITIONS_MAP } from "@webfoot/core/db/constants";
import playerSorter from "@webfoot/core/engine/sorters/player";
import type { IPlayer } from "@webfoot/core/models/types";

import { RoundContext } from "../../contexts/round";
import { SimulationsContext } from "../../contexts/simulations";
import type { ModalInjuryInfo } from "../../types";

type Props = {
  info: Accessor<ModalInjuryInfo>;
  onClose: () => void;
};

const ModalInjury = ({ info: infoIds, onClose }: Props) => {
  const round = useContext(RoundContext);
  const { simulations, triggerUpdate } = useContext(SimulationsContext);
  const [selectedPlayer, setSelectedPlayer] = createSignal<IPlayer | null>(null);

  const simulation = () => {
    if (!infoIds()) return null;
    return simulations()[infoIds()!.fixtureId];
  };

  const player = () => simulation()?.getPlayer(infoIds()!.playerId) ?? null;

  const team = () => {
    if (!simulation()) return null;
    const teamId = infoIds()!.teamId;
    return round().teams![teamId];
  };
  const teamSquad = () => {
    if (!team()) return null;
    if (simulation()!.fixture.homeId === infoIds()!.teamId)
      return simulation()!.squads.home.bench.toSorted(playerSorter);
    return simulation()!.squads.away.bench.toSorted(playerSorter);
  };

  const title = () => team()?.name ?? "";

  const subButtonDisabled = () => {
    if (!teamSquad() || !selectedPlayer()) return true;
    const isInjuriedPlayerGK = player()!.position === "G";
    const isBenchedGKAvailable = teamSquad()!.some(({ position }) => position === "G");
    if (isInjuriedPlayerGK && isBenchedGKAvailable) {
      return selectedPlayer()!.position !== "G";
    }
    if (!isInjuriedPlayerGK && selectedPlayer()!.position === "G") return true;
    return false;
  };

  function handleSubstitution() {
    simulation()!.substitutePlayers(team()!.id, player()!.id, selectedPlayer()!.id);
    triggerUpdate();
    onClose();
  }

  return (
    <Modal show={infoIds} class="w-[390px] h-[220px]">
      <Layout class="w-full h-full" title={title} onClickClose={onClose}>
        <Show when={team}>
          <DivInTeamColors
            class="w-full h-full text-sm flex flex-col justify-between p-2"
            background={team()!.background}
            foreground={team()!.foreground}
          >
            <div>
              <p>
                {player()!.name}
                <span>{` (${PLAYER_POSITIONS_MAP[player()!.position]}) `}</span>lesionou-se e tem de
                ser substituído.
              </p>
              <p>Escolha o jogador a entrar.</p>
            </div>
            <div class="grid grid-cols-3">
              <Frame class="col-span-2">
                <div role="table">
                  <For each={teamSquad()}>
                    {(benchedPlayer) => (
                      <DivInTeamColors
                        class="flex font-bold gap-2 px-2"
                        role="row"
                        background={team()!.background}
                        foreground={team()!.foreground}
                        selected={() => benchedPlayer.id === selectedPlayer()?.id}
                        onClick={() => setSelectedPlayer(benchedPlayer)}
                      >
                        <div role="cell" class="w-2">
                          {benchedPlayer.position}
                        </div>
                        <div role="cell" class="w-2/3">
                          <p>
                            {benchedPlayer.name} <span>{benchedPlayer.star ? "*" : ""}</span>
                          </p>
                        </div>
                        <div role="cell">{benchedPlayer.power}</div>
                      </DivInTeamColors>
                    )}
                  </For>
                </div>
              </Frame>
              <Button
                class="style-98 self-end ml-auto"
                disabled={!!subButtonDisabled()}
                onClick={handleSubstitution}
              >
                Substituir
              </Button>
            </div>
          </DivInTeamColors>
        </Show>
      </Layout>
    </Modal>
  );
};

export default ModalInjury;
