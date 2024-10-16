import { useContext } from "solid-js";

import TableOfPlayers from "@webfoot/components/TableOfPlayers";
import type { IPlayer } from "@webfoot/core/models/types";

import { ClubContext } from "../../contexts/club";
import { LayoutContext } from "../../contexts/layout";

const DashboardTableOfPlayers = () => {
  const club = useContext(ClubContext);
  const {
    handlers: { setSelectedPlayers, setVisiblePlayer, setVisibleTab },
    values: { selectedPlayers },
  } = useContext(LayoutContext);

  function onSelectPlayer(selectedPlayerId: IPlayer["id"]) {
    const players = club().players!;

    let firstTeam = selectedPlayers().firstTeam;
    let substitutes = selectedPlayers().substitutes;

    const isSelectedPlayerCurrentlyOnFirstTeam = firstTeam.some(
      ({ id }) => id === selectedPlayerId,
    );
    const isSelectedPlayerCurrentlyOnBench = substitutes.some(({ id }) => id === selectedPlayerId);
    if (isSelectedPlayerCurrentlyOnFirstTeam) {
      firstTeam = firstTeam.filter(({ id }) => id !== selectedPlayerId);
      substitutes.push(players.find(({ id }) => id === selectedPlayerId)!);
    } else if (isSelectedPlayerCurrentlyOnBench) {
      substitutes = substitutes.filter(({ id }) => id !== selectedPlayerId);
    } else {
      firstTeam.push(players.find(({ id }) => id === selectedPlayerId)!);
    }
    setSelectedPlayers({
      firstTeam,
      substitutes,
    });
  }

  return (
    <TableOfPlayers
      class="h-full overflow-y-auto text-sm"
      players={club().players!}
      background={club().team!.background}
      foreground={club().team!.foreground}
      onClickPlayer={(playerId) => {
        const player = club().players!.find(({ id }) => playerId === id)!;
        setVisiblePlayer(player);
        setVisibleTab("Player");
      }}
      onSelectPlayer={onSelectPlayer}
      selectedPlayers={selectedPlayers}
      isDashboard
    />
  );
};

export default DashboardTableOfPlayers;
