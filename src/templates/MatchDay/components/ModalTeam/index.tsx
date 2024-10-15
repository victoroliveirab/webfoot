import { useContext, type Accessor, Show } from "solid-js";

import DivInTeamColors from "@webfoot/components/DivInTeamColors";
import Layout from "@webfoot/components/Layout";
import Modal from "@webfoot/components/Modal";
import { IPlayer } from "@webfoot/core/models/types";

import ActionTables from "./components/ActionTables";
import Occurances from "./components/Occurances";
import { RoundContext } from "../../contexts/round";
import { SimulationsContext } from "../../contexts/simulations";
import type { ModalTeamInfo } from "../../types";

type Props = {
  info: Accessor<ModalTeamInfo>;
  onClose: () => void;
};

const ModalTeam = ({ info: infoIds, onClose }: Props) => {
  const round = useContext(RoundContext);
  const { simulations, triggerUpdate } = useContext(SimulationsContext);

  const fixture = () => {
    if (!infoIds()) return null;
    for (const fixturesByChampionship of Object.values(round().fixtures!)) {
      for (const fixture of Object.values(fixturesByChampionship)) {
        if (fixture.id === infoIds()!.fixtureId) return fixture;
      }
    }
    return null;
  };
  const simulation = () =>
    fixture()
      ? Object.values(simulations()).find(
          ({ fixture: { id: fixtureId } }) => fixtureId === fixture()!.id,
        )!
      : null;

  const title = () => {
    if (!simulation()) return "";
    const homeTeamName = round().teams![simulation()!.fixture.homeId].name;
    const awayTeamName = round().teams![simulation()!.fixture.awayId].name;
    const [homeTeamGoals, awayTeamGoals] = simulation()!.currentScoreline;
    return `${homeTeamName}, ${homeTeamGoals} - ${awayTeamName}, ${awayTeamGoals}`;
  };
  const team = () => {
    if (!simulation()) return null;
    if (simulation()!.fixture.homeId === infoIds()!.teamId)
      return round().teams![simulation()!.fixture.homeId];
    return round().teams![simulation()!.fixture.awayId];
  };
  const teamSquad = () => {
    if (!team()) return null;
    if (simulation()!.fixture.homeId === infoIds()!.teamId) return simulation()!.squads.home;
    return simulation()!.squads.away;
  };
  const showSubstituteButton = () => {
    if (!team()) return false;
    if (!round().humanTrainerTeams!.includes(team()!.id)) return false;
    const subsLeftKey =
      team()!.id === simulation()!.fixture.homeId ? "homeSubsLeft" : "awaySubsLeft";
    return simulation()![subsLeftKey] > 0;
  };

  function handleSubstitution(playerOut: IPlayer, playerIn: IPlayer) {
    simulation()!.substitutePlayers(team()!.id, playerOut.id, playerIn.id);
    triggerUpdate();
  }

  return (
    <Modal show={infoIds} class="w-[640px] h-[480px]">
      <Layout class="w-full h-full" title={title} onClickClose={onClose}>
        <div class="flex flex-col h-full w-full">
          <div class="flex-grow w-full">
            <Occurances simulation={simulation} />
          </div>
          <div class="flex-1 px-2 pb-px">
            <div class="h-full flex flex-col relative pt-3">
              <DivInTeamColors
                class="h-full flex flex-col relative pt-3"
                background={team()!.background}
                foreground={team()!.foreground}
              >
                <h2
                  class="text-xs font-bold uppercase absolute top-2 left-2"
                  style={{
                    "background-color": team()!.background,
                  }}
                >
                  {team()?.name}
                </h2>
                <div class="flex-1">
                  <Show when={!!team()}>
                    <ActionTables
                      onClickSubstitute={handleSubstitution}
                      showSubstituteButton={showSubstituteButton}
                      team={() => team()!}
                      teamSquad={teamSquad}
                    />
                  </Show>
                </div>
              </DivInTeamColors>
            </div>
          </div>
        </div>
      </Layout>
    </Modal>
  );
};

export default ModalTeam;
