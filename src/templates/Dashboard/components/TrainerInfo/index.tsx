import { createResource, useContext } from "solid-js";

import { League } from "@webfoot/core/models";

import { ClubContext } from "../../contexts/club";
import { LayoutContext } from "../../contexts/layout";

export default function TrainerInfo() {
  const club = useContext(ClubContext);
  const {
    handlers: { setModalTrainerHistoryOpened },
  } = useContext(LayoutContext);

  const [league] = createResource(async () => League.getById(club().championship!.leagueId));

  return (
    <div class="flex pb-2 px-3 gap-1">
      <div class="w-12 flex items-end justify-end">
        <img src="/src/assets/flags/BRA.BMP" class="w-full" />
      </div>
      <div class="flex-1 flex flex-col justify-between">
        <h2 class="font-bold text-sm" onClick={() => setModalTrainerHistoryOpened(true)}>
          {club().trainer!.name}
        </h2>
        <p class="mb-2 ml-2">Brasil</p>
      </div>
      <div class="flex-1 flex flex-col justify-end">
        <p>{league()?.name}</p>
      </div>
    </div>
  );
}
