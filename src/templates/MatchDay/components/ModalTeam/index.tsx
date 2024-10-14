import { useContext, type Accessor } from "solid-js";

import Button from "@webfoot/components/Button";
import DivInTeamColors from "@webfoot/components/DivInTeamColors";
import Layout from "@webfoot/components/Layout";
import Modal from "@webfoot/components/Modal";

import Occurances from "./components/Occurances";
import Table from "./components/Table";
import { RoundContext } from "../../contexts/round";
import type { ModalTeamInfo, SimulationsSignal } from "../../types";

type Props = {
  info: Accessor<ModalTeamInfo>;
  onClose: () => void;
  simulations: Accessor<SimulationsSignal>;
};

const ModalTeam = ({ info: infoIds, onClose, simulations }: Props) => {
  const round = useContext(RoundContext);

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
      ? Object.values(simulations()!.simulations!).find(
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
                  <div class="h-full border border-black">
                    <div class="grid grid-cols-2 items-center gap-8 px-4 pt-3 pb-2">
                      <Table
                        class="h-[220px] border border-black"
                        players={() => teamSquad()?.playing ?? []}
                      />
                      <div class="flex flex-col h-full justify-between">
                        <Table
                          class="h-[100px] border border-black"
                          players={() => teamSquad()?.bench ?? []}
                        />
                        <div class="flex justify-end pb-1">
                          {round().humanTrainerTeams!.includes(team()?.id ?? 0) && (
                            <Button class="style-98" disabled>
                              Substituir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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
