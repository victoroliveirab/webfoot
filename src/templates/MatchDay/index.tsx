import { useContext, type Component, createSignal, For, Show, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Clock from "@webfoot/components/Clock";

import DivisionBlock from "./components/DivisionBlock";
import ModalInjury from "./components/ModalInjury";
import ModalTeam from "./components/ModalTeam";
import RoundProvider, { RoundContext } from "./contexts/round";
import SimulationsProvider, { SimulationsContext } from "./contexts/simulations";
import type { ModalInjuryInfo, ModalTeamInfo } from "./types";
import { IFixture } from "@webfoot/core/models/types";
import { updateStandings } from "./helpers";

type HumanActionRequired =
  | {
      type: "HALFTIME";
      data: NonNullable<ModalTeamInfo>;
    }
  | {
      type: "INJURY";
      data: NonNullable<ModalInjuryInfo>;
    }
  | {
      type: "REDCARD";
      data: NonNullable<ModalTeamInfo>;
    };

const FPS = 20;
const TIMEOUT = 1000 / FPS;

const MatchDay: Component = () => {
  const navigate = useNavigate();
  const round = useContext(RoundContext);
  const {
    humanTrainerTeams,
    ready: simulationsReady,
    simulations,
    triggerUpdate,
  } = useContext(SimulationsContext);

  const [clock, setClock] = createSignal(0);
  const [timer, setTimer] = createSignal<number | null>(null);
  const [teamModalInfo, setTeamModalInfo] = createSignal<ModalTeamInfo>(null);
  const [injuryModalInfo, setInjuryModalInfo] = createSignal<ModalInjuryInfo>(null);
  let requireHumanActions: HumanActionRequired[] = [];

  createEffect(() => {
    if (simulationsReady() && clock() === 0) setTimer(setInterval(tick, TIMEOUT));
  });

  function tick() {
    const fixtureSimulations = Object.values(simulations());
    const now = clock() + 1;
    for (const simulation of fixtureSimulations) {
      const newSimulationState = simulation.tick();
      if (newSimulationState.newStories.length > 0) {
        const storiesThatNeedIntervention = newSimulationState.newStories.filter(({ type }) =>
          ["INJURY", "REDCARD"].includes(type),
        );
        for (const story of storiesThatNeedIntervention) {
          const storyPlayerTeam = simulation.getPlayer(story.playerId)!.teamId;
          const isTeamControlledByHuman = humanTrainerTeams.includes(storyPlayerTeam);
          if (!isTeamControlledByHuman) continue;
          switch (story.type) {
            case "REDCARD": {
              requireHumanActions.push({
                type: "REDCARD",
                data: {
                  teamId: storyPlayerTeam,
                  oppositionId:
                    simulation.fixture.homeId === storyPlayerTeam
                      ? simulation.fixture.awayId
                      : simulation.fixture.homeId,
                  fixtureId: simulation.fixture.id,
                },
              });
              break;
            }
            case "INJURY": {
              requireHumanActions.push({
                type: "INJURY",
                data: {
                  fixtureId: simulation.fixture.id,
                  playerId: story.playerId,
                  teamId: storyPlayerTeam,
                },
              });
              break;
            }
            default: {
              console.error({ story, newSimulationState, simulation });
              throw new Error("You messed something up");
            }
          }
        }
      }
    }
    if (now > 90) {
      clearInterval(timer()!);
      // Probably a good idea dismiss this timeout if we click in a team and reset the timer
      setTimeout(finishRound, 2000);
      return;
    }
    if (now === 45) {
      clearInterval(timer()!);
      for (const teamId of humanTrainerTeams) {
        const { fixture } = fixtureSimulations.find(
          (simulation) =>
            simulation.fixture.homeId === teamId || simulation.fixture.awayId === teamId,
        )!;
        const oppositionId = fixture.homeId === teamId ? fixture.awayId : fixture.homeId;
        requireHumanActions.push({
          type: "HALFTIME",
          data: {
            fixtureId: fixture.id,
            oppositionId,
            teamId,
          },
        });
      }
    } else if (requireHumanActions.length > 0) {
      clearInterval(timer()!);
    }
    setClock(now);
    triggerUpdate();
    if (requireHumanActions.length > 0) {
      handlePlayerActionRequired();
    }
  }

  function handlePlayerActionRequired() {
    const actionRequired = requireHumanActions.shift();
    if (!actionRequired) {
      setTeamModalInfo(null);
      setInjuryModalInfo(null);
      return;
    }
    if (actionRequired.type === "INJURY") {
      setInjuryModalInfo(actionRequired.data);
      setTeamModalInfo(null);
    } else if (actionRequired.type === "REDCARD" || actionRequired.type === "HALFTIME") {
      setTeamModalInfo(actionRequired.data);
      setInjuryModalInfo(null);
    }
  }

  function handleCloseTeamModal() {
    setTeamModalInfo(null);
    if (requireHumanActions.length > 0) {
      handlePlayerActionRequired();
      return;
    }
    if (clock() < 90) {
      setTimer(setInterval(tick, TIMEOUT));
    }
  }

  function handleCloseInjuryModal() {
    setInjuryModalInfo(null);
    if (requireHumanActions.length > 0) {
      handlePlayerActionRequired();
      return;
    }
    if (clock() < 90) {
      setTimer(setInterval(tick, TIMEOUT));
    }
  }

  async function finishRound() {
    const simulationEntities = Object.values(simulations());
    const fixtures: IFixture["id"][] = [];
    for (const simulation of simulationEntities) {
      await simulation.finish();
      fixtures.push(simulation.fixture.id);
    }
    await updateStandings(fixtures);

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
      <ModalInjury info={injuryModalInfo} onClose={handleCloseInjuryModal} />
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
