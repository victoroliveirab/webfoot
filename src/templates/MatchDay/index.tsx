import { useContext, type Component, createSignal, createEffect, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Clock from "@webfoot/components/Clock";
import Simulator from "@webfoot/core/engine/simulator";
import postRoundProcessor from "@webfoot/core/engine/processors/post-round";

import DivisionBlock from "./components/DivisionBlock";
import ModalTeam from "./components/ModalTeam";
import RoundProvider, { RoundContext } from "./contexts/round";
import type { ModalTeamInfo, SimulationsSignal } from "./types";

const FPS = 20;
const TIMEOUT = 1000 / FPS;

const MatchDay: Component = () => {
  const navigate = useNavigate();
  const round = useContext(RoundContext);
  const [simulations, setSimulations] = createSignal<SimulationsSignal>({
    clock: 0,
    simulations: null,
  });
  const [timer, setTimer] = createSignal<number | null>(null);
  const [teamModalInfo, setTeamModalInfo] = createSignal<ModalTeamInfo>(null);

  createEffect(() => {
    if (round().ready) {
      const simulations: SimulationsSignal["simulations"] = {};
      const allChampionshipsIds = Object.keys(round().fixtures!);
      for (const championshipId of allChampionshipsIds) {
        const allFixtures = round().fixtures![+championshipId];
        for (const fixture of Object.values(allFixtures)) {
          const simulator = new Simulator({
            awayMorale: round().teams![fixture.awayId].morale,
            awayInitialSquad: round().initialSquads![fixture.id].away,
            fixture,
            homeMorale: round().teams![fixture.homeId].morale,
            homeInitialSquad: round().initialSquads![fixture.id].home,
            stadiumCapacity: round().teams![fixture.homeId].currentStadiumCapacity,
          });
          simulations[fixture.id] = simulator;
        }
      }
      setSimulations({
        clock: 0,
        simulations,
      });
      setTimer(setInterval(tick, TIMEOUT));
    }
  });

  function tick() {
    const fixtureSimulations = Object.values(simulations().simulations!);
    const now = simulations().clock;
    for (const simulation of fixtureSimulations) simulation.tick();
    if (now >= 90) {
      clearInterval(timer()!);
      setTimeout(finishRound, 2000);
      return;
    }
    setSimulations({
      clock: now + 1,
      simulations: simulations().simulations,
    });
  }

  async function finishRound() {
    const simulationEntities = Object.values(simulations().simulations!);
    await postRoundProcessor(simulationEntities);
    navigate("/standings");
  }

  const ready = () => round().ready && !!simulations().simulations;

  return (
    <Show when={ready()}>
      <div class="w-full flex justify-end">
        <Clock radius={30} time={() => Math.min(simulations().clock, 90)} />
      </div>
      <For each={Object.keys(round().fixtures!)}>
        {(championshipId) => (
          <DivisionBlock
            championshipId={+championshipId}
            onTeamClick={(fixtureId: number, teamId: number, oppositionId: number) => {
              clearInterval(timer() ?? 0);
              setTeamModalInfo({
                fixtureId,
                teamId,
                oppositionId,
              });
            }}
            simulations={simulations}
          />
        )}
      </For>
      <ModalTeam
        info={teamModalInfo}
        simulations={simulations}
        onClose={() => {
          simulations().clock < 90 && setTimer(setInterval(tick, TIMEOUT));
          setTeamModalInfo(null);
        }}
      />
    </Show>
  );
};

export default () => (
  <RoundProvider>
    <MatchDay />
  </RoundProvider>
);
