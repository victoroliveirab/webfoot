import { splitProps, type Accessor, type JSX, type ParentProps } from "solid-js";

import type { ITeam } from "@webfoot/core/models/types";

type Props = {
  background: ITeam["background"];
  border?: ITeam["border"];
  foreground: ITeam["foreground"];
  selected?: Accessor<boolean>;
} & JSX.HTMLElementTags["div"];

export default function DivInTeamColors(props: ParentProps<Props>) {
  const [styleProps, renderProps, otherProps] = splitProps(
    props,
    ["background", "border", "foreground", "selected"],
    ["children"],
  );
  return (
    <div
      style={{
        background: styleProps.selected?.() ? styleProps.foreground : styleProps.background,
        "border-color": styleProps.border ?? "transparent",
        color: styleProps.selected?.() ? styleProps.background : styleProps.foreground,
      }}
      {...otherProps}
    >
      {renderProps.children}
    </div>
  );
}
