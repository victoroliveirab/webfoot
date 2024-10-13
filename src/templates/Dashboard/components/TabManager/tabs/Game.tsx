import { Show, createEffect, createResource, useContext } from "solid-js";

import MoraleProgressBar from "@webfoot/components/MoraleProgressBar";
import StandingLine from "@webfoot/components/StandingLine";
import { describeNumberMoney } from "@webfoot/utils/number";

import { ClubContext } from "../../../contexts/club";
import { FixtureContext } from "../../../contexts/fixture";
import { Championship, Fixture } from "@webfoot/core/models";
import { IFixture, ITeam } from "@webfoot/core/models/types";

function getResultLetter(fixture: IFixture, teamId: ITeam["id"]) {
  if (fixture.homeGoals > fixture.awayGoals) {
    return fixture.homeId === teamId ? "V" : "D";
  }
  if (fixture.homeGoals < fixture.awayGoals) {
    return fixture.homeId === teamId ? "D" : "V";
  }
  return "E";
}

const Game = () => {
  const club = useContext(ClubContext);
  const fixture = useContext(FixtureContext);

  const [lastFixture] = createResource(async () => {
    const fixtureHash = fixture().fixture!.homeAwayHash;
    const fixtures = await Fixture.getMultipleByIndex("homeAwayHash", fixtureHash);
    if (fixtures.length === 0) return null;
    let index = 0;
    while (fixtures[index] && fixtures[index].occurred) ++index;
    const lastFixture = fixtures[index - 1];
    const resultLetter = getResultLetter(lastFixture, club().team!.id);
    const seasonOfLastFixture = (await Championship.getById(lastFixture.championshipId)).season;
    return {
      result: `${lastFixture.homeGoals}:${lastFixture.awayGoals}`,
      resultLetter,
      season: seasonOfLastFixture,
    };
  });

  createEffect(() => {
    console.log(lastFixture());
  });

  const homeTeam = () => (fixture().venue! === "H" ? club().team! : fixture().opponent!);
  const awayTeam = () => (fixture().venue! === "A" ? club().team! : fixture().opponent!);

  return (
    <div class="flex-1 flex flex-col justify-between py-4 pl-1 pr-px">
      <div class="border border-w3c-gray">
        <StandingLine
          background={homeTeam().background}
          foreground={homeTeam().foreground}
          data={{
            ...fixture().standings!.H,
            teamName: homeTeam().name,
          }}
        />
        <StandingLine
          background={awayTeam().background}
          foreground={awayTeam().foreground}
          data={{
            ...fixture().standings!.A,
            teamName: awayTeam().name,
          }}
        />
      </div>
      <div class="flex-1 pt-10 pl-4 pr-px text-xs">
        <h3 class="mb-2">Árbitro</h3>
        <h4 class="font-bold">Pierugi Colina (Itália)</h4>
      </div>
      <div class="flex-1 pl-4 pr-px">
        <Show when={lastFixture.state === "ready" && !!lastFixture()}>
          <h3 class="flex gap-4">
            <span class="text-xs">Último Jogo</span>
            <p class="flex gap-1 text-lg font-bold">
              <span>{lastFixture()!.resultLetter}</span>
              <span>{lastFixture()!.result}</span>
              <span class="ml-1">{`(${lastFixture()!.season})`}</span>
            </p>
          </h3>
        </Show>
      </div>
      <div class="ml-4 text-sm mb-4">
        <h3>Dinheiro em caixa</h3>
        <p>{describeNumberMoney(club().team!.currentCash)}</p>
      </div>
      <div class="px-2">
        <h3 class="mb-2 ml-2 text-sm">Moral</h3>
        <MoraleProgressBar morale={club().team!.morale} />
      </div>
    </div>
  );
};

export default Game;
