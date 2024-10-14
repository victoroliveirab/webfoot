import { type Accessor, Show, createResource, useContext } from "solid-js";

import { Championship, League } from "@webfoot/core/models";

import { RoundContext } from "../../contexts/round";
import Match from "./components/Match";
import type { SimulationsSignal } from "../../types";

type Props = {
  championshipId: number;
  onTeamClick: (fixtureId: number, teamId: number, oppositionId: number) => void;
  simulations: Accessor<SimulationsSignal>;
};

const DivisionBlock = ({ championshipId, onTeamClick, simulations }: Props) => {
  const round = useContext(RoundContext);
  const fixtures = () => Object.values(round().fixtures![championshipId]);
  const [championship] = createResource(async () => Championship.getById(championshipId));
  const [league] = createResource(championship, async () =>
    League.getById(championship()!.leagueId),
  );

  return (
    <section class="border border-black w-full p-1 mt-4">
      <Show when={league.state === "ready" && !!simulations()}>
        <h2 class="-mt-4 ml-20 font-bold text-w3c-yellow bg-w3c-green w-fit px-1">
          {league()!.name}
        </h2>
      </Show>
      <ul class="flex flex-col gap-2 px-4">
        {fixtures().map((fixture) => (
          <Match
            championshipId={championshipId}
            fixtureId={fixture.id}
            onTeamClick={onTeamClick}
            simulation={() => simulations().simulations![fixture.id]}
          />
        ))}
      </ul>
    </section>
  );
};

export default DivisionBlock;
