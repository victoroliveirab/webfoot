import { type JSX, type ParentProps } from "solid-js";

import type { ITeam } from "@webfoot/core/models/types";

type Props = {
  background: ITeam["background"];
  border?: ITeam["border"];
  class?: JSX.HTMLElementTags["div"]["class"];
  foreground: ITeam["foreground"];
  role?: JSX.HTMLElementTags["div"]["role"];
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
