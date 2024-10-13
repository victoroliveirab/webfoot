import { For, createResource } from "solid-js";

import {
  playerSorterByGoalsScoredAllTime,
  playerSorterByGoalsThisSeason,
} from "@webfoot/core/engine/sorters/player";
import { GameLoop, Player, Team } from "@webfoot/core/models";
import type { IPlayer } from "@webfoot/core/models/types";
import { arrayToHashMap } from "@webfoot/utils/array";

type Props = {
  class?: string;
  currentSeason?: boolean;
};

function getFilterFn(currentSeason: Props["currentSeason"]) {
  return currentSeason
    ? (player: IPlayer) => player.stats.seasonGoals > 0
    : (player: IPlayer) => player.stats.goals > 0;
}

function getGetterFn(currentSeason: Props["currentSeason"]) {
  return currentSeason
    ? (player: IPlayer) => player.stats.seasonGoals
    : (player: IPlayer) => player.stats.goals;
}

const TableBestScorers = ({ class: className, currentSeason }: Props) => {
  const maxNumberOfScorers = GameLoop.getMaxNumberOfScorers();
  const getterFn = getGetterFn(currentSeason);
  const [bestScorers] = createResource(async () => {
    const allPlayers = await Player.getAll();
    const filterFn = getFilterFn(currentSeason);
    const scorers = allPlayers.filter(filterFn);
    scorers.sort(currentSeason ? playerSorterByGoalsThisSeason : playerSorterByGoalsScoredAllTime);
    if (scorers.length <= maxNumberOfScorers) return scorers;
    const numberOfGoalsScoredByLastPlayer = getterFn(scorers[maxNumberOfScorers - 1]);
    let index = maxNumberOfScorers;
    while (index < scorers.length && getterFn(scorers[index]) === numberOfGoalsScoredByLastPlayer)
      ++index;
    return scorers.slice(0, index + 1);
  });
  const [teams] = createResource(async () => {
    const allTeams = await Team.getAll();
    return arrayToHashMap(allTeams);
  });

  return (
    <div role="table" class={className}>
      <For each={bestScorers()}>
        {(scorer, index) => (
          <div role="row" class="flex gap-4 px-4 text-sm">
            <div role="cell" class="w-4 text-right">
              {index() + 1}
            </div>
            <div role="cell" class="flex-1 font-bold text-nowrap">
              {scorer.name}
              <span>{scorer.star ? "*" : ""}</span>
            </div>
            <div role="cell" class="w-4 font-bold text-right">
              {getterFn(scorer)}
            </div>
            <div role="cell" class="flex-1 uppercase">
              {teams.state === "ready" ? teams()[scorer.teamId].name : ""}
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

export default TableBestScorers;
