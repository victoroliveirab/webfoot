import { useContext, type Accessor, Show } from "solid-js";

import TeamBlock from "@webfoot/components/TeamBlock";
import type Simulator from "@webfoot/core/engine/simulator";
import { getAllPlayersOnSimulator } from "@webfoot/core/engine/simulator/helpers";
import type { IChampionship, IFixture } from "@webfoot/core/models/types";

import LastOccurance from "./components/LastOccurance";
import { RoundContext } from "../../../../contexts/round";
import type { LastOccuranceData } from "../../../../types";

type Props = {
  championshipId: IChampionship["id"];
  fixtureId: IFixture["id"];
  onTeamClick: (fixtureId: number, teamId: number, oppositionId: number) => void;
  simulation: Accessor<Simulator>;
};

const Match = ({ championshipId, fixtureId, onTeamClick, simulation }: Props) => {
  const round = useContext(RoundContext);

  const fixture = round().fixtures![championshipId][fixtureId];
  const teams = round().teams!;

  const homeTeam = teams[fixture.homeId];
  const awayTeam = teams[fixture.awayId];

  const lastOccuranceData: Accessor<LastOccuranceData | null> = () => {
    const lastOccurance = simulation().lastOccurance;
    if (!lastOccurance) return null;
    const player = getAllPlayersOnSimulator(simulation()).find(
      ({ id }) => id === lastOccurance.playerId,
    )!;
    return {
      ...lastOccurance,
      player,
    };
  };

  return (
    <li class="flex items-center gap-2">
      <span class="text-w3c-yellow w-12 text-right mr-2">{simulation().attendees}</span>
      <TeamBlock
        class="w-56 h-8 shrink-0"
        background={homeTeam.background}
        foreground={homeTeam.foreground}
        border={homeTeam.border}
        onClick={() => onTeamClick(fixtureId, homeTeam.id, awayTeam.id)}
      >
        {homeTeam.name}
      </TeamBlock>
      <span class="font-bold text-w3c-yellow">{simulation().currentScoreline[0]}</span>
      <span class="font-bold text-w3c-yellow">{simulation().currentScoreline[1]}</span>
      <TeamBlock
        class="w-56 h-8 shrink-0"
        background={awayTeam.background}
        foreground={awayTeam.foreground}
        border={awayTeam.border}
        onClick={() => onTeamClick(fixtureId, awayTeam.id, homeTeam.id)}
      >
        {awayTeam.name}
      </TeamBlock>
      <div class="flex items-center gap-1 text-w3c-yellow overflow-hidden">
        <Show when={lastOccuranceData}>
          <LastOccurance data={lastOccuranceData as Accessor<LastOccuranceData>} />
        </Show>
      </div>
    </li>
  );
};

export default Match;
