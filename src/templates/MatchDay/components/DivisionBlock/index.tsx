import { Show, createResource, useContext } from "solid-js";

import { Championship, League } from "@webfoot/core/models";

import Match from "./components/Match";
import { RoundContext } from "../../contexts/round";
import { SimulationsContext } from "../../contexts/simulations";

type Props = {
  championshipId: number;
  onTeamClick: (fixtureId: number, teamId: number, oppositionId: number) => void;
};

const DivisionBlock = ({ championshipId, onTeamClick }: Props) => {
  const round = useContext(RoundContext);
  const { simulations } = useContext(SimulationsContext);

  const fixtures = () => Object.values(round().fixtures![championshipId]);
  const [championship] = createResource(async () => Championship.getById(championshipId));
  const [league] = createResource(championship, async () =>
    League.getById(championship()!.leagueId),
  );

  return (
    <section class="border border-black w-full p-1 mt-4">
      <Show when={league.state === "ready"}>
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
            simulation={() => simulations()[fixture.id]}
          />
        ))}
      </ul>
    </section>
  );
};

export default DivisionBlock;
