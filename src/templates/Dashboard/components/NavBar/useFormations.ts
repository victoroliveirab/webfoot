import { createMemo, useContext } from "solid-js";

import { DropdownOption } from "@webfoot/components/Dropdown";
import {
  pickBestAvailable,
  pickSquadByFormation,
  pickSquadRandomly,
} from "@webfoot/core/engine/pickers/squad";

import { formations } from "../../constants";
import { ClubContext } from "../../contexts/club";
import { LayoutContext } from "../../contexts/layout";

// REFACTOR: refactor so we can attach the shortcuts to the DOM
export default function useFormationsOptions() {
  const club = useContext(ClubContext);
  const {
    handlers: { setSelectedPlayers, setVisibleTab },
  } = useContext(LayoutContext);
  // Inside memo so if we remove a player from the list (by selling it)
  // The options are recalculated
  const options = createMemo<DropdownOption[]>(() => {
    const players = club().players!;
    const availablePlayersByPosition = players.reduce(
      (acc, { position, suspensionPeriod }) => {
        if (position === "G" || suspensionPeriod > 0) return acc;
        if (position === "D")
          return {
            ...acc,
            D: acc.D + 1,
          };
        if (position === "M")
          return {
            ...acc,
            M: acc.M + 1,
          };
        return {
          ...acc,
          A: acc.A + 1,
        };
      },
      { D: 0, M: 0, A: 0 },
    );
    const formationOptions = formations.map((formation, index) => {
      const [dQuantity, mQuantity, aQuantity] = formation.split("-").map(Number);
      const enabled =
        availablePlayersByPosition.D >= dQuantity &&
        availablePlayersByPosition.M >= mQuantity &&
        availablePlayersByPosition.A >= aQuantity;
      return {
        disabled: !enabled,
        label: formation,
        onClick: () => {
          const formationDistribution = {
            G: 1,
            D: dQuantity,
            M: mQuantity,
            A: aQuantity,
          };
          const squad = pickSquadByFormation(players, formationDistribution);
          setSelectedPlayers(squad);
          setVisibleTab("Selection");
        },
        shortcut: `F${index + 1}`,
      };
    });
    const automaticOption = {
      label: "Automático",
      onClick: () => {
        const squad = pickSquadRandomly(players);
        setSelectedPlayers(squad);
        setVisibleTab("Selection");
      },
      shortcut: "A",
    };
    const bestsOption = {
      label: "Melhores",
      onClick: () => {
        const squad = pickBestAvailable(players);
        setSelectedPlayers(squad);
        setVisibleTab("Selection");
      },
      shortcut: "M",
    };
    return [...formationOptions, { divider: true }, automaticOption, bestsOption];
  });
  return options;
}
