import { useContext } from "solid-js";

import DivInTeamColors from "@webfoot/components/DivInTeamColors";
import TeamBlock from "@webfoot/components/TeamBlock";
import { GameLoop } from "@webfoot/core/models";

import { FixtureContext } from "../../contexts/fixture";

export default function NextOpponent() {
  const fixture = useContext(FixtureContext);
  const round = GameLoop.getWeek()!;
  const year = GameLoop.getYear()!;

  return (
    <div class="flex flex-col justify-between pt-1 pr-1">
      <h3 class="text-sm flex justify-between pr-8">
        <span>Adversário</span>
        <span class="font-bold">{year}</span>
      </h3>
      <DivInTeamColors class="ml-3 mb-1 uppercase" {...fixture().opponent!}>
        <TeamBlock
          class="text-base"
          background={fixture().opponent!.background}
          foreground={fixture().opponent!.foreground}
        >
          {fixture().opponent!.name}
        </TeamBlock>
        <p class="pl-1 text-base">
          <span>{fixture().venue === "A" ? "FORA" : "CASA"}</span>
          <span class="ml-1 normal-case">{`${round}ª Jornada`}</span>
        </p>
      </DivInTeamColors>
    </div>
  );
}
