import { ParentProps } from "solid-js";

import type { ITeam } from "@webfoot/core/models/types";

type Props = {
  background: ITeam["background"];
  border?: ITeam["border"];
  class: HTMLDivElement["className"];
  foreground: ITeam["foreground"];
  role?: HTMLDivElement["role"];
};

export default function DivInTeamColors(props: ParentProps<Props>) {
  return (
    <div
      class={props.class}
      style={{
        background: props.background,
        "border-color": props.border ?? "transparent",
        color: props.foreground,
      }}
    >
      {props.children}
    </div>
  );
}
