import {
  type Accessor,
  type ParentProps,
  createContext,
  useContext,
  createSignal,
  createEffect,
} from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

import Simulator from "@webfoot/core/engine/simulator";
import type { IFixture, IPlayer, ITeam, ITrainer } from "@webfoot/core/models/types";

import { RoundContext } from "./round";
import { GameLoop } from "@webfoot/core/models";
import { defaultCalculators } from "@webfoot/core/engine/calculators/default";

type LocationState = {
  squadsByTrainer: Record<
    ITrainer["id"],
    {
      squad: {
        firstTeam: IPlayer["id"][];
        substitutes: IPlayer["id"][];
      };
      teamId: ITeam["id"];
    }
  >;
};

type Simulations = Record<IFixture["id"], Simulator>;

type ISimulationsContext = {
  humanTrainerTeams: ITeam["id"][];
  ready: Accessor<boolean>;
  simulations: Accessor<Simulations>;
  triggerUpdate: () => unknown;
};

type WrappedSimulations = {
  simulations: Simulations;
  updates: number;
};

export const SimulationsContext = createContext<ISimulationsContext>({
  humanTrainerTeams: [],
  ready: () => false,
  simulations: () => ({}),
  triggerUpdate: () => null,
});

export default function SimulationsProvider(props: ParentProps) {
  const navigate = useNavigate();
  const round = useContext(RoundContext);
  const { state } = useLocation<LocationState>();

  if (!state || !state.squadsByTrainer) {
    console.error("Expected state to have an object of squads by human trainer, found:", state);
    navigate("/");
    return;
  }
  const trainersTeams = Object.values(state.squadsByTrainer);
  const humanTrainerTeams = trainersTeams.map(({ teamId }) => teamId);

  const [simulationsWrapped, setSimulationsWrapped] = createSignal<WrappedSimulations>({
    simulations: {},
    updates: 0,
  });

  createEffect(() => {
    if (round().ready) {
      const simulations: Simulations = {};
      const allChampionshipsIds = Object.keys(round().fixtures!);
      for (const championshipId of allChampionshipsIds) {
        const allFixtures = round().fixtures![+championshipId];
        for (const fixture of Object.values(allFixtures)) {
          const homeTeamIsHumanControlled = trainersTeams.find(
            ({ teamId }) => teamId === fixture.homeId,
          );
          const awayTeamIsHumanControlled = trainersTeams.find(
            ({ teamId }) => teamId === fixture.awayId,
          );
          const simulator = new Simulator({
            awayTeam: awayTeamIsHumanControlled
              ? {
                  morale: round().teams![fixture.awayId].morale,
                  squad: {
                    // REFACTOR: improve this
                    playing: awayTeamIsHumanControlled.squad.firstTeam.map(
                      (id) =>
                        round()!.players![fixture.awayId].find(
                          ({ id: playerId }) => id === playerId,
                        )!,
                    ),
                    bench: awayTeamIsHumanControlled.squad.substitutes.map(
                      (id) =>
                        round()!.players![fixture.awayId].find(
                          ({ id: playerId }) => id === playerId,
                        )!,
                    ),
                  },
                }
              : {
                  aiStrategy: "Standard",
                  morale: round().teams![fixture.awayId].morale,
                  players: round()!.players![fixture.awayId],
                },
            calculators: defaultCalculators,
            fixture,
            homeTeam: homeTeamIsHumanControlled
              ? {
                  morale: round().teams![fixture.homeId].morale,
                  squad: {
                    playing: homeTeamIsHumanControlled.squad.firstTeam.map(
                      (id) =>
                        round()!.players![fixture.homeId].find(
                          ({ id: playerId }) => id === playerId,
                        )!,
                    ),
                    bench: homeTeamIsHumanControlled.squad.substitutes.map(
                      (id) =>
                        round()!.players![fixture.homeId].find(
                          ({ id: playerId }) => id === playerId,
                        )!,
                    ),
                  },
                }
              : {
                  aiStrategy: "Standard",
                  morale: round().teams![fixture.homeId].morale,
                  players: round()!.players![fixture.homeId],
                },
            stadiumCapacity: round().teams![fixture.homeId].currentStadiumCapacity,
          });
          simulations[fixture.id] = simulator;
        }
      }
      setSimulationsWrapped({
        simulations,
        updates: 1,
      });
    }
  });

  // Hacky way to tell solid to re-render after we update a non-reactive value
  function triggerUpdate() {
    const previousState = simulationsWrapped();
    setSimulationsWrapped({
      simulations: previousState.simulations,
      updates: previousState.updates + 1,
    });
  }

  const simulations = () => simulationsWrapped().simulations;
  const ready = () => Object.keys(simulations()).length > 0;

  return (
    <SimulationsContext.Provider value={{ humanTrainerTeams, simulations, ready, triggerUpdate }}>
      {props.children}
    </SimulationsContext.Provider>
  );
}
