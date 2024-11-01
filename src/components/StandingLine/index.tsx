import type { IStanding, ITeam } from "@webfoot/core/models/types";

import DivInTeamColors from "../DivInTeamColors";

export type StandingLineProps = {
  background: ITeam["background"];
  border?: ITeam["border"];
  class?: string;
  data: IStanding & {
    teamName: string;
  };
  foreground: ITeam["foreground"];
  onClick?: (team: ITeam["id"]) => unknown;
};

const StandingLine = ({
  background,
  border,
  class: className = "",
  data,
  foreground,
  onClick,
}: StandingLineProps) => {
  return (
    <DivInTeamColors
      role="row"
      class={`flex gap-8 text-xs pl-px pr-2 py-px ${border ? "border" : ""} ${className}`}
      background={background}
      border={border}
      foreground={foreground}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(data.teamId);
      }}
    >
      <p class="flex-grow uppercase text-nowrap">{data.teamName}</p>
      <div class="flex gap-3">
        <span class="w-4 text-right">{data.wins}</span>
        <span class="w-4 text-right">{data.draws}</span>
        <span class="w-4 text-right">{data.losses}</span>
      </div>
      <div class="flex justify-center">
        <span class="w-4">{data.goalsPro}</span>
        <span class="w-4 text-center">:</span>
        <span class="w-4 text-right">{data.goalsAgainst}</span>
      </div>
      <span class="inline-block w-4 text-right">{data.points}</span>
    </DivInTeamColors>
  );
};

export default StandingLine;
