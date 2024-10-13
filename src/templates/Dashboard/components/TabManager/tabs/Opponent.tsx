import { useContext } from "solid-js";

import Button from "@webfoot/components/Button";
import MoraleProgressBar from "@webfoot/components/MoraleProgressBar";
import TeamBlock from "@webfoot/components/TeamBlock";

import { FixtureContext } from "../../../contexts/fixture";
import { LayoutContext } from "../../../contexts/layout";

const Opponent = () => {
  const fixture = useContext(FixtureContext);
  const {
    handlers: { setModalOpponentCalendarOpened, setModalOpponentTrainerHistoryOpened },
  } = useContext(LayoutContext);

  return (
    <div class="h-full flex flex-col justify-between pl-2 pr-8 py-3">
      <div class="h-1/2 flex flex-col justify-between">
        <div class="flex flex-col gap-4">
          <TeamBlock
            background={fixture().opponent!.background}
            foreground={fixture().opponent!.foreground}
            border="gray"
            class="text-center"
          >
            {fixture().opponent!.name}
          </TeamBlock>
          <MoraleProgressBar morale={fixture().opponent!.morale} />
        </div>
        <p class="flex gap-4 text-xs ml-2">
          <span>Treinador</span>
          <span onClick={() => setModalOpponentTrainerHistoryOpened(true)}>
            {fixture().opponentTrainer!.name}
          </span>
        </p>
      </div>
      <div class="h-1/2 flex flex-col justify-end">
        <ul class="flex justify-end gap-2">
          <li>
            <Button class="style-98" onClick={() => setModalOpponentCalendarOpened(true)}>
              Calendário
            </Button>
          </li>
          <li>
            <Button class="style-98">Plantel</Button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Opponent;
