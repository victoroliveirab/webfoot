import {
  type Accessor,
  type ParentProps,
  createContext,
  useContext,
  createSignal,
  createEffect,
} from "solid-js";

import Simulator from "@webfoot/core/engine/simulator";
import type { IFixture } from "@webfoot/core/models/types";

import { RoundContext } from "./round";

type Simulations = Record<IFixture["id"], Simulator>;

type ISimulationsContext = {
  ready: Accessor<boolean>;
  simulations: Accessor<Simulations>;
  triggerUpdate: () => unknown;
};

type WrappedSimulations = {
  simulations: Simulations;
  updates: number;
};

export const SimulationsContext = createContext<ISimulationsContext>({
  ready: () => false,
  simulations: () => ({}),
  triggerUpdate: () => null,
});

export default function SimulationsProvider(props: ParentProps) {
  const round = useContext(RoundContext);
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
          const simulator = new Simulator({
            awayMorale: round().teams![fixture.awayId].morale,
            awayInitialSquad: round().initialSquads![fixture.id].away,
            awayTeamIsHumanControlled: round().humanTrainerTeams!.includes(fixture.awayId),
            fixture,
            homeMorale: round().teams![fixture.homeId].morale,
            homeInitialSquad: round().initialSquads![fixture.id].home,
            homeTeamIsHumanControlled: round().humanTrainerTeams!.includes(fixture.homeId),
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
    <SimulationsContext.Provider value={{ simulations, ready, triggerUpdate }}>
      {props.children}
    </SimulationsContext.Provider>
  );
}
