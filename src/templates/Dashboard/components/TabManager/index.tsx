import { Match, type ParentProps, Switch, useContext } from "solid-js";

import Game from "./tabs/Game";
import PlayerTab from "./tabs/Player";
import Finances from "./tabs/Finances";
import Selection from "./tabs/Selection";
import Opponent from "./tabs/Opponent";
import { LayoutContext } from "../../contexts/layout";

const TabSelector = ({
  active,
  children,
  onClick,
}: ParentProps<{ active?: () => boolean; onClick: () => void }>) => {
  return (
    <div
      class={`flex-shrink-0 border-b ${active?.() ? "border-b-w3c-gray" : "border-b-transparent"}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const TabManager = () => {
  const {
    handlers: { setVisibleTab },
    values: { visibleTab },
  } = useContext(LayoutContext);
  return (
    <div class="flex flex-col gap-4">
      <div class="h-full flex flex-col justify-between">
        <Switch>
          <Match when={visibleTab() === "Game"}>
            <Game />
          </Match>
          <Match when={visibleTab() === "Player"}>
            <PlayerTab />
          </Match>
          <Match when={visibleTab() === "Finances"}>
            <Finances />
          </Match>
          <Match when={visibleTab() === "Selection"}>
            <Selection />
          </Match>
          <Match when={visibleTab() === "Opponent"}>
            <Opponent />
          </Match>
        </Switch>
        <nav class="flex justify-center gap-2">
          <TabSelector active={() => visibleTab() === "Game"} onClick={() => setVisibleTab("Game")}>
            Jogo
          </TabSelector>
          <TabSelector
            active={() => visibleTab() === "Player"}
            onClick={() => setVisibleTab("Player")}
          >
            Jogador
          </TabSelector>
          <TabSelector
            active={() => visibleTab() === "Finances"}
            onClick={() => setVisibleTab("Finances")}
          >
            Finanças
          </TabSelector>
          <TabSelector
            active={() => visibleTab() === "Selection"}
            onClick={() => setVisibleTab("Selection")}
          >
            Seleção
          </TabSelector>
          <TabSelector
            active={() => visibleTab() === "Opponent"}
            onClick={() => setVisibleTab("Opponent")}
          >
            Adversário
          </TabSelector>
        </nav>
      </div>
    </div>
  );
};

export default TabManager;
