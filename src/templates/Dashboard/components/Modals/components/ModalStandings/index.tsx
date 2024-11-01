import { useContext } from "solid-js";

import Layout from "@webfoot/components/Layout";
import Standings from "@webfoot/components/Standings";
import { GameLoop } from "@webfoot/core/models";

import { LayoutContext } from "../../../../contexts/layout";

export default function ModalStandings() {
  const {
    handlers: { setModalStandingsOpened, setVisibleTeam },
  } = useContext(LayoutContext);
  const year = GameLoop.getYear()!;

  return (
    <Layout
      title={() => "Classificação"}
      class="w-[720px]"
      onClickClose={() => setModalStandingsOpened(false)}
    >
      <Standings
        year={year}
        onTeamClick={(team) => setVisibleTeam(team)}
        onClose={() => setModalStandingsOpened(false)}
      />
    </Layout>
  );
}
