import { useContext, type ParentProps } from "solid-js";

import DivInTeamColors from "@webfoot/components/DivInTeamColors";

import { ClubContext } from "../../contexts/club";
import styles from "./styles.module.css";

export default function Grid(props: ParentProps) {
  const club = useContext(ClubContext);
  return (
    <DivInTeamColors
      class={`grid w-full h-full pl-1 pt-1 pb-2 ${styles.dashboard}`}
      {...club().team!}
    >
      {props.children}
    </DivInTeamColors>
  );
}
