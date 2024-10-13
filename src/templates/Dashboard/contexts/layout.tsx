import {
  type ParentProps,
  createContext,
  createSignal,
  type Accessor,
  type Setter,
} from "solid-js";

import { IPlayer } from "@webfoot/core/models/types";

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
  modalStandingsOpened: boolean;
  openedDropdown: OpenedDropdown;
  selectedPlayers: DashboardSquad;
  visiblePlayer: IPlayer | null;
  visibleTab: Tabs;
};

type ILayoutContext = ContextBuilder<UnwrapedContext>;

const defaultHandler = () => null;

export const LayoutContext = createContext<ILayoutContext>({
  handlers: {
    setModalBestScorersSeasonOpened: defaultHandler,
    setModalCalendarTeamOpened: defaultHandler,
    setModalStandingsOpened: defaultHandler,
    setOpenedDropdown: defaultHandler,
    setSelectedPlayers: defaultHandler,
    setVisiblePlayer: defaultHandler,
    setVisibleTab: defaultHandler,
  },
  values: {
    modalBestScorersSeasonOpened: () => false,
    modalCalendarTeamOpened: () => false,
    modalStandingsOpened: () => false,
    openedDropdown: () => null,
    selectedPlayers: () => ({
      firstTeam: [],
      substitutes: [],
    }),
    visiblePlayer: () => null,
    visibleTab: () => "Game" as const,
  },
});

export default function LayoutProvider(props: ParentProps) {
  const [modalBestScorersSeasonOpened, setModalBestScorersSeasonOpened] = createSignal(false);
  const [modalCalendarTeamOpened, setModalCalendarTeamOpened] = createSignal(false);
  const [modalStandingsOpened, setModalStandingsOpened] = createSignal(false);
  const [openedDropdown, setOpenedDropdown] = createSignal<OpenedDropdown>(null);
  const [selectedPlayers, setSelectedPlayers] = createSignal<DashboardSquad>({
    firstTeam: [],
    substitutes: [],
  });
  const [visiblePlayer, setVisiblePlayer] = createSignal<IPlayer | null>(null);
  const [visibleTab, setVisibleTab] = createSignal<Tabs>("Game");

  const value = {
    values: {
      modalBestScorersSeasonOpened,
      modalCalendarTeamOpened,
      modalStandingsOpened,
      openedDropdown,
      selectedPlayers,
      visiblePlayer,
      visibleTab,
    },
    handlers: {
      setModalBestScorersSeasonOpened,
      setModalCalendarTeamOpened,
      setModalStandingsOpened,
      setOpenedDropdown,
      setSelectedPlayers,
      setVisiblePlayer,
      setVisibleTab,
    },
  };

  return <LayoutContext.Provider value={value}>{props.children}</LayoutContext.Provider>;
}
