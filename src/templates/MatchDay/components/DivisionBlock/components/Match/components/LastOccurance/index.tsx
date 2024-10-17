import { Switch, type Accessor, Match, type ParentProps } from "solid-js";

import type Simulator from "@webfoot/core/engine/simulator";
import type { IPlayer } from "@webfoot/core/models/types";

type Props = {
  data: Accessor<
    Simulator["lastOccurance"] & {
      player: IPlayer;
    }
  >;
};

const Injury = () => (
  <div class="h-4 w-4 bg-white shrink-0 relative">
    <div class="absolute top-0 left-[6px] h-full w-1 bg-w3c-red"></div>
    <div class="absolute left-0 top-[6px] w-full h-1 bg-w3c-red"></div>
  </div>
);
const RedCard = () => <div class="h-4 w-4 bg-w3c-red shrink-0"></div>;
const Player = (props: ParentProps) => (
  <span class="text-nowrap overflow-hidden">{props.children}</span>
);
const Time = (props: ParentProps) => <span>{`${props.children}`}&#39;</span>;

export default function LastOccurance(props: Props) {
  return (
    <Switch>
      <Match when={props.data()?.type === "REDCARD"}>
        <>
          <RedCard />
          <Player>{props.data()!.player.name}</Player>
          <Time>{props.data()!.time}</Time>
        </>
      </Match>
      <Match when={props.data()?.type === "INJURY"}>
        <Injury />
        <Player>{props.data()!.player.name}</Player>
        <Time>{props.data()!.time}</Time>
      </Match>
      <Match when={props.data()?.type === "GOAL_REGULAR"}>
        <Player>{props.data()!.player.name}</Player>
        <Time>{props.data()!.time}</Time>
      </Match>
    </Switch>
  );
}
