import { type Accessor, For, Show, createResource } from "solid-js";

import { Championship, Fixture, Team } from "@webfoot/core/models";
import type { ITeam } from "@webfoot/core/models/types";
import { arrayToHashMap } from "@webfoot/utils/array";

type Props = {
  team: Accessor<ITeam>;
};

const Calendar = ({ team }: Props) => {
  const [championship] = createResource(async () => Championship.getById(team().championshipId!));
  const [fixtures] = createResource(championship, async () => {
    const allFixtures = await Fixture.getMultipleByIndex("championshipId", championship()!.id);
    return allFixtures.filter(({ awayId, homeId }) => awayId === team().id || homeId === team().id);
  });
  const [tableLines] = createResource(fixtures, async () => {
    const teams = await Team.getMultipleByIndex("championshipId", championship()!.id);
    const teamsHashMap = arrayToHashMap(teams);
    return fixtures()!.map(
      ({ attendees, awayGoals, awayId, homeGoals, homeId, occurred, round }) => {
        if (homeId === team().id) {
          return {
            attendees: occurred ? attendees : null,
            opponent: teamsHashMap[awayId].name,
            result: occurred
              ? `${homeId === team().id ? homeGoals : awayGoals} : ${awayId === team().id ? awayGoals : homeGoals}`
              : null,
            round,
            venue: "C",
          };
        }
        return {
          attendees: occurred ? attendees : null,
          opponent: teamsHashMap[homeId].name,
          result: occurred
            ? `${homeId === team().id ? homeGoals : awayGoals} : ${awayId === team().id ? homeGoals : awayGoals}`
            : null,
          round,
          venue: "F",
        };
      },
    );
  });

  return (
    <div role="table" class="w-full text-sm">
      <Show when={tableLines.state === "ready"}>
        <For each={tableLines()}>
          {(line) => (
            <div
              role="row"
              class={`flex pr-4 gap-4 ${line.venue === "C" ? "bg-w3c-blue text-white" : "bg-white text-w3c-blue"}`}
            >
              <div role="cell" class="w-8 text-right">
                {line.round}
              </div>
              <div role="cell" class="w-2/5 uppercase">
                {line.opponent}
              </div>
              <div role="cell" class="w-8">
                {line.venue}
              </div>
              <div role="cell" class="flex-1">
                {line.result}
              </div>
              <div role="cell" class="w-8">
                {line.attendees}
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};

export default Calendar;
