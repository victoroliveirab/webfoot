import { useContext, type Accessor } from "solid-js";

import TeamBlock from "@webfoot/components/TeamBlock";
import Simulator from "@webfoot/core/engine/simulator";
import { getAllPlayersOnSimulator } from "@webfoot/core/engine/simulator/helpers";
import type { IChampionship, IFixture } from "@webfoot/core/models/types";

import { RoundContext } from "../../../../contexts/round";

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

  const lastOccurance = () => simulation().lastOccurance;
  const playerOfLastOccurance = () => {
    if (!lastOccurance()) return;
    const playerId = lastOccurance()!.playerId;
    const players = getAllPlayersOnSimulator(simulation());
    return players.find(({ id }) => id === playerId);
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
        {lastOccurance()?.type === "REDCARD" ? (
          <div class="h-4 w-4 bg-w3c-red shrink-0"></div>
        ) : null}
        <span class="text-nowrap overflow-hidden">{playerOfLastOccurance()?.name}</span>
        {lastOccurance()?.time && <span>{`${lastOccurance()!.time}`}&#39;</span>}
      </div>
    </li>
  );
};

export default Match;
