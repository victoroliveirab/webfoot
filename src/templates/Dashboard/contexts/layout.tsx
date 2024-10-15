import {
  type ParentProps,
  createContext,
  createSignal,
  type Accessor,
  type Setter,
} from "solid-js";

import type { IPlayer, ITeam } from "@webfoot/core/models/types";

import type { DashboardSquad, OpenedDropdown, Tabs } from "../types";

type ContextAccessor<T> = {
  [K in keyof T]: Accessor<T[K]>;
};
type ContextSetter<T> = {
  [K in keyof T]: Setter<T[K]>;
};
type CapitalizeFirstLetter<S extends string> = S extends `${infer F}${infer T}`
  ? `${Uppercase<F>}${T}`
  : S;
type ContextBuilder<T> = {
  values: ContextAccessor<T>;
  handlers: {
    [K in keyof T as `set${CapitalizeFirstLetter<string & K>}`]: ContextSetter<T>[K];
  };
};

type UnwrapedContext = {
  modalBestScorersSeasonOpened: boolean;
  modalCalendarTeamOpened: boolean;
  modalOpponentCalendarOpened: boolean;
  modalOpponentTrainerHistoryOpened: boolean;
  modalStandingsOpened: boolean;
  modalTrainerHistoryOpened: boolean;
  openedDropdown: OpenedDropdown;
  selectedPlayers: DashboardSquad;
  visiblePlayer: IPlayer | null;
  visibleTab: Tabs;
  visibleTeam: ITeam["id"] | null;
};

type ILayoutContext = ContextBuilder<UnwrapedContext>;

const defaultHandler = () => null;

export const LayoutContext = createContext<ILayoutContext>({
  handlers: {
    setModalBestScorersSeasonOpened: defaultHandler,
    setModalCalendarTeamOpened: defaultHandler,
    setModalOpponentCalendarOpened: defaultHandler,
    setModalOpponentTrainerHistoryOpened: defaultHandler,
    setModalStandingsOpened: defaultHandler,
    setModalTrainerHistoryOpened: defaultHandler,
    setOpenedDropdown: defaultHandler,
    setSelectedPlayers: defaultHandler,
    setVisiblePlayer: defaultHandler,
    setVisibleTab: defaultHandler,
    setVisibleTeam: defaultHandler,
  },
  values: {
    modalBestScorersSeasonOpened: () => false,
    modalCalendarTeamOpened: () => false,
    modalOpponentCalendarOpened: () => false,
    modalOpponentTrainerHistoryOpened: () => false,
    modalStandingsOpened: () => false,
    modalTrainerHistoryOpened: () => false,
    openedDropdown: () => null,
    selectedPlayers: () => ({
      firstTeam: [],
      substitutes: [],
    }),
    visiblePlayer: () => null,
    visibleTab: () => "Game" as const,
    visibleTeam: () => null,
  },
});

export default function LayoutProvider(props: ParentProps) {
  const [modalBestScorersSeasonOpened, setModalBestScorersSeasonOpened] = createSignal(false);
  const [modalCalendarTeamOpened, setModalCalendarTeamOpened] = createSignal(false);
  const [modalOpponentCalendarOpened, setModalOpponentCalendarOpened] = createSignal(false);
  const [modalOpponentTrainerHistoryOpened, setModalOpponentTrainerHistoryOpened] =
    createSignal(false);
  const [modalStandingsOpened, setModalStandingsOpened] = createSignal(false);
  const [modalTrainerHistoryOpened, setModalTrainerHistoryOpened] = createSignal(false);
  const [openedDropdown, setOpenedDropdown] = createSignal<OpenedDropdown>(null);
  const [selectedPlayers, setSelectedPlayers] = createSignal<DashboardSquad>({
    firstTeam: [],
    substitutes: [],
  });
  const [visiblePlayer, setVisiblePlayer] = createSignal<IPlayer | null>(null);
  const [visibleTab, setVisibleTab] = createSignal<Tabs>("Game");
  const [visibleTeam, setVisibleTeam] = createSignal<ITeam["id"] | null>(null);

  const value = {
    values: {
      modalBestScorersSeasonOpened,
      modalCalendarTeamOpened,
      modalOpponentCalendarOpened,
      modalOpponentTrainerHistoryOpened,
      modalStandingsOpened,
      modalTrainerHistoryOpened,
      openedDropdown,
      selectedPlayers,
      visiblePlayer,
      visibleTab,
      visibleTeam,
    },
    handlers: {
      setModalBestScorersSeasonOpened,
      setModalCalendarTeamOpened,
      setModalOpponentCalendarOpened,
      setModalOpponentTrainerHistoryOpened,
      setModalStandingsOpened,
      setModalTrainerHistoryOpened,
      setOpenedDropdown,
      setSelectedPlayers,
      setVisiblePlayer,
      setVisibleTab,
      setVisibleTeam,
    },
  };

  return <LayoutContext.Provider value={value}>{props.children}</LayoutContext.Provider>;
}
