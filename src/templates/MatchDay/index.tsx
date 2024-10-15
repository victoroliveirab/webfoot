import { useContext, type Component, createSignal, For, Show, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Clock from "@webfoot/components/Clock";
import postRoundProcessor from "@webfoot/core/engine/processors/post-round";

import DivisionBlock from "./components/DivisionBlock";
import ModalTeam from "./components/ModalTeam";
import RoundProvider, { RoundContext } from "./contexts/round";
import type { ModalTeamInfo } from "./types";
import SimulationsProvider, { SimulationsContext } from "./contexts/simulations";

const FPS = 20;
const TIMEOUT = 1000 / FPS;

const MatchDay: Component = () => {
  const navigate = useNavigate();
  const round = useContext(RoundContext);
  const { ready: simulationsReady, simulations, triggerUpdate } = useContext(SimulationsContext);

  const [clock, setClock] = createSignal(0);
  const [timer, setTimer] = createSignal<number | null>(null);
  const [teamModalInfo, setTeamModalInfo] = createSignal<ModalTeamInfo>(null);
  let requireHumanActions: ModalTeamInfo[] = [];

  createEffect(() => {
    if (simulationsReady() && clock() === 0) setTimer(setInterval(tick, TIMEOUT));
  });

  function tick() {
    const fixtureSimulations = Object.values(simulations());
    const now = clock();
    const isHalfTime = now === 45;
    const triggerRequiredHumanAction: NonNullable<ModalTeamInfo>[] = [];
    for (const simulation of fixtureSimulations) {
      const newSimulationState = simulation.tick();
      // If it is halftime, we are opening all the modals anyway, so we can skip this
      if (!isHalfTime && newSimulationState.newStories.length > 0) {
        for (const story of newSimulationState.newStories) {
          const isStoryToTriggerInteraction = story.type === "REDCARD" || story.type === "INJURY";
          const storyPlayerTeam = simulation.getPlayer(story.playerId)!.teamId;
          const isTeamControlledByHuman = round().humanTrainerTeams!.includes(storyPlayerTeam);
          if (isStoryToTriggerInteraction && isTeamControlledByHuman) {
            triggerRequiredHumanAction.push({
              teamId: storyPlayerTeam,
              oppositionId:
                simulation.fixture.homeId === storyPlayerTeam
                  ? simulation.fixture.awayId
                  : simulation.fixture.homeId,
              fixtureId: simulation.fixture.id,
            });
          }
        }
      }
    }
    if (now >= 90) {
      clearInterval(timer()!);
      // Probably a good idea dismiss this timeout if we click in a team and reset the timer
      setTimeout(finishRound, 2000);
      return;
    }
    if (now === 45) {
      clearInterval(timer()!);
      const trainerTeams = round().humanTrainerTeams!;
      for (const teamId of trainerTeams) {
        const { fixture } = fixtureSimulations.find(
          (simulation) =>
            simulation.fixture.homeId === teamId || simulation.fixture.awayId === teamId,
        )!;
        const oppositionId = fixture.homeId === teamId ? fixture.awayId : fixture.homeId;
        triggerRequiredHumanAction.push({
          fixtureId: fixture.id,
          oppositionId,
          teamId,
        });
      }
      requireHumanActions = triggerRequiredHumanAction;
    } else if (triggerRequiredHumanAction.length > 0) {
      clearInterval(timer()!);
      requireHumanActions = triggerRequiredHumanAction;
    }
    if (requireHumanActions.length === 0) {
      setClock(now + 1);
    } else setTeamModalInfo(requireHumanActions.pop()!);
    triggerUpdate();
  }

  function handleCloseTeamModal() {
    if (requireHumanActions.length > 0) {
      const nextTeamInfo = requireHumanActions.pop()!;
      setTeamModalInfo(nextTeamInfo);
    } else {
      if (clock() < 90) {
        setTimer(setInterval(tick, TIMEOUT));
        setClock(clock() + 1);
      }
      setTeamModalInfo(null);
    }
  }

  async function finishRound() {
    const simulationEntities = Object.values(simulations());
    await postRoundProcessor(simulationEntities);
    navigate("/standings");
  }

  const ready = () => round().ready && !!simulationsReady();

  return (
    <Show when={ready()}>
      <div class="w-full flex justify-end">
        <Clock radius={30} time={() => Math.min(clock(), 90)} />
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
          />
        )}
      </For>
      <ModalTeam info={teamModalInfo} onClose={handleCloseTeamModal} />
    </Show>
  );
};

export default () => (
  <RoundProvider>
    <SimulationsProvider>
      <MatchDay />
    </SimulationsProvider>
  </RoundProvider>
);
