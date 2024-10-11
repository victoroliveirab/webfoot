import { useContext } from "solid-js";

import MoraleProgressBar from "@webfoot/components/MoraleProgressBar";
import StandingLine from "@webfoot/components/StandingLine";
import { describeNumberMoney } from "@webfoot/utils/number";

import { ClubContext } from "../../../contexts/club";
import { FixtureContext } from "../../../contexts/fixture";

const Game = () => {
  const club = useContext(ClubContext);
  const fixture = useContext(FixtureContext);

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
      <div class="flex-1 pr-px">
        <div class="mt-10 ml-4 text-sm">
          <h3 class="mb-2">Árbitro</h3>
          <h4 class="font-bold">Pierugi Colina (Itália)</h4>
        </div>
      </div>
      <div class="flex flex-col gap-8">
        <div class="ml-4 text-sm">
          <h4>Dinheiro em caixa</h4>
          <p>{describeNumberMoney(club().team!.currentCash)}</p>
        </div>
        <div class="px-2">
          <h4 class="mb-2 ml-2 text-sm">Moral</h4>
          <MoraleProgressBar morale={club().team!.morale} />
        </div>
      </div>
    </div>
  );
};

export default Game;
