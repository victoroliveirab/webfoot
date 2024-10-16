import { For, Show, createResource } from "solid-js";

import standingSorter from "@webfoot/core/engine/sorters/standing";
import { Championship, Standing, Team } from "@webfoot/core/models";
import type { IStanding, ITeam } from "@webfoot/core/models/types";
import useDBReady from "@webfoot/hooks/useDBReady";
import { arrayToHashMap } from "@webfoot/utils/array";

import StandingLine from "../StandingLine";

type Props = {
  onTeamClick?: (teamId: ITeam["id"]) => unknown;
  year: number;
};

const Standings = ({ onTeamClick, year }: Props) => {
  const isDBReady = useDBReady();
  const [championships] = createResource(isDBReady, async () =>
    Championship.getMultipleByIndex("season", year),
  );
  const [standings] = createResource(championships, async () => {
    const standings: IStanding[][] = [];
    for (const { id: championshipId } of championships()!) {
      const standingsOfChampionship = await Standing.getMultipleByIndex(
        "championshipId",
        championshipId,
      );
      standingsOfChampionship.sort(standingSorter);
      // REFACTOR: use some field to set the division level
      // Since we create the championships in the order of divisions, this is fine for now
      standings.push(standingsOfChampionship);
    }
    return standings;
  });
  const [teams] = createResource(standings, async () => {
    const teamsIds = standings()!
      .flat()
      .map(({ teamId }) => teamId);
    const teams = await Team.getMultipleByIds(teamsIds);
    return arrayToHashMap(teams);
  });

  return (
    <div class="w-full h-full py-4 px-3 grid grid-cols-2 grid-rows-2 grid-flow-col gap-6 select-none bg-w3c-green">
      <Show when={teams.state === "ready"}>
        <For each={standings()!}>
          {(division, index) => (
            <div>
              <h2 class="text-w3c-yellow text-2xl font-bold mb-px">{`${index() + 1}ª Divisão`}</h2>
              <div role="table" class="border border-w3c-gray">
                <For each={division}>
                  {(line) => (
                    <StandingLine
                      background={teams()![line.teamId].background}
                      foreground={teams()![line.teamId].foreground}
                      data={{
                        ...line,
                        teamName: teams()![line.teamId].name,
                      }}
                      onClick={onTeamClick}
                    />
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};

export default Standings;
