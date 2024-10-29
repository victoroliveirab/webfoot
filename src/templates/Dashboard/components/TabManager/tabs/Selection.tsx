import { useContext } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Button from "@webfoot/components/Button";

import { ClubContext } from "../../../contexts/club";
import { LayoutContext } from "../../../contexts/layout";

const Selection = () => {
  const navigate = useNavigate();
  const club = useContext(ClubContext);
  const {
    values: { selectedPlayers },
  } = useContext(LayoutContext);

  const isSquadReady = () => {
    const { firstTeam, substitutes } = selectedPlayers();
    const requiredNumberOfPlayers = Math.min(11, club().players!.length);
    const maxAllowedSubs = 5;
    if (requiredNumberOfPlayers !== firstTeam.length) return false;
    if (substitutes.length > maxAllowedSubs) return false;
    let numberOfGKs = 0;
    let numberOfSuspendeds = 0;
    let numberOfInjureds = 0;
    for (const playerEntity of firstTeam) {
      if (playerEntity.position === "G") ++numberOfGKs;
      if (playerEntity.suspensionPeriod > 0) ++numberOfSuspendeds;
      if (playerEntity.injuryPeriod > 0) ++numberOfInjureds;
    }
    for (const playerEntity of substitutes) {
      if (playerEntity.suspensionPeriod > 0) ++numberOfSuspendeds;
      if (playerEntity.injuryPeriod > 0) ++numberOfInjureds;
    }
    return numberOfGKs === 1 && numberOfSuspendeds === 0 && numberOfInjureds === 0;
  };

  function submit() {
    if (!isSquadReady()) return;
    const firstTeam = selectedPlayers().firstTeam.map(({ id }) => id);
    const substitutes = selectedPlayers().substitutes.map(({ id }) => id);
    const notSelected = club().players!.filter(
      (player) => !firstTeam.includes(player.id) && !substitutes.includes(player.id),
    );

    navigate("/match-day", {
      state: {
        // FIXME: when introducing multiplayers, this has to be taken into account
        // Receive the previous and pass to the next
        squadsByTrainer: {
          1: {
            teamId: club().team!.id,
            squad: {
              firstTeam,
              substitutes,
              notSelected,
            },
          },
        },
      },
    });
  }

  return (
    <div class="h-full flex flex-col items-center justify-end pb-8">
      <Button class="style-98" disabled={!isSquadReady()} onClick={submit}>
        <span class="block">&nbsp;</span>
        <span class="block">Jogar</span>
      </Button>
    </div>
  );
};

export default Selection;
