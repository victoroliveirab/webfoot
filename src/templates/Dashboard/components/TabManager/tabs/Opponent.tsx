import { useContext } from "solid-js";

import Button from "@webfoot/components/Button";
import TeamBlock from "@webfoot/components/TeamBlock";

import { ClubContext } from "../../../contexts/club";

const Opponent = () => {
  const club = useContext(ClubContext);
  return (
    <div class="h-full flex flex-col justify-between pl-2 pr-8 py-3">
      <div class="h-1/2 flex flex-col justify-between">
        <div class="flex flex-col gap-4">
          <TeamBlock
            background={club().team!.background}
            foreground={club().team!.foreground}
            border="gray"
            class="text-center"
          >
            {club().team!.name}
          </TeamBlock>
        </div>
      </div>
      <div class="h-1/2 flex flex-col justify-end">
        <ul class="flex justify-end gap-2">
          <li>
            <Button class="style-98">Calendário</Button>
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
