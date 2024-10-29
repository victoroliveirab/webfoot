import {
  type Accessor,
  type ParentProps,
  createContext,
  useContext,
  createSignal,
  createEffect,
} from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

import { defaultCalculators } from "@webfoot/core/engine/calculators/default";
import { defaultProcessors } from "@webfoot/core/engine/processors/default";
import Simulator, { SimulatorTeam } from "@webfoot/core/engine/simulator";
import type { IFixture, IPlayer, ITeam, ITrainer } from "@webfoot/core/models/types";

import { RoundContext } from "./round";

type LocationState = {
  squadsByTrainer: Record<
    ITrainer["id"],
    {
      squad: {
        firstTeam: IPlayer["id"][];
        substitutes: IPlayer["id"][];
        notSelected: IPlayer["id"][];
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

  function simulatorFactory(fixture: IFixture) {
    const homeTeamIsHumanControlled = trainersTeams.find(({ teamId }) => teamId === fixture.homeId);
    const awayTeamIsHumanControlled = trainersTeams.find(({ teamId }) => teamId === fixture.awayId);

    let simulatorAwayTeam: SimulatorTeam;
    const awayTeam = round().teams![fixture.awayId];
    const awayMorale = awayTeam.morale;
    const awayPlayers = round().players![awayTeam.id];

    if (awayTeamIsHumanControlled) {
      const playing = awayPlayers.filter((player) =>
        awayTeamIsHumanControlled.squad.firstTeam.includes(player.id),
      );
      const bench = awayPlayers.filter((player) =>
        awayTeamIsHumanControlled.squad.substitutes.includes(player.id),
      );
      const out = awayPlayers.filter((player) =>
        awayTeamIsHumanControlled.squad.notSelected.includes(player.id),
      );
      simulatorAwayTeam = {
        squad: {
          playing,
          bench,
          out,
        },
        morale: awayMorale,
      };
    } else {
      simulatorAwayTeam = {
        aiStrategy: "Standard",
        morale: awayMorale,
        players: awayPlayers,
      };
    }

    let simulatorHomeTeam: SimulatorTeam;
    const homeTeam = round().teams![fixture.homeId];
    const homeMorale = homeTeam.morale;
    const homePlayers = round().players![homeTeam.id];

    if (homeTeamIsHumanControlled) {
      const playing = homePlayers.filter((player) =>
        homeTeamIsHumanControlled.squad.firstTeam.includes(player.id),
      );
      const bench = homePlayers.filter((player) =>
        homeTeamIsHumanControlled.squad.substitutes.includes(player.id),
      );
      const out = homePlayers.filter((player) =>
        homeTeamIsHumanControlled.squad.notSelected.includes(player.id),
      );
      simulatorHomeTeam = {
        squad: {
          playing,
          bench,
          out,
        },
        morale: homeMorale,
      };
    } else {
      simulatorHomeTeam = {
        aiStrategy: "Standard",
        morale: homeMorale,
        players: homePlayers,
      };
    }

    return new Simulator({
      awayTeam: simulatorAwayTeam,
      calculators: defaultCalculators,
      fixture,
      homeTeam: simulatorHomeTeam,
      processors: defaultProcessors,
      stadiumCapacity: homeTeam.currentStadiumCapacity,
    });
  }

  createEffect(() => {
    if (round().ready) {
      const simulations: Simulations = {};
      const allChampionshipsIds = Object.keys(round().fixtures!);
      for (const championshipId of allChampionshipsIds) {
        const allFixtures = round().fixtures![+championshipId];
        for (const fixture of Object.values(allFixtures)) {
          const simulator = simulatorFactory(fixture);
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
