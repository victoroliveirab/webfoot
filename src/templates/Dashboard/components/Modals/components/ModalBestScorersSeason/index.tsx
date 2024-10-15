import { useContext } from "solid-js";
import Layout from "@webfoot/components/Layout";
import TableBestScorers from "@webfoot/components/TableBestScorers";

import { LayoutContext } from "../../../../contexts/layout";

export default function ModalBestScorersSeason() {
  const {
    handlers: { setModalBestScorersSeasonOpened },
  } = useContext(LayoutContext);

  return (
    <Layout
      title={() => "Melhores marcadores desta época"}
      class="max-h-[640px] w-[480px]"
      onClickClose={() => setModalBestScorersSeasonOpened(false)}
      actions={
        <button
          class="style-98 h-8 w-24 font-bold !text-xs"
          onClick={() => setModalBestScorersSeasonOpened(false)}
        >
          OK
        </button>
      }
      withContainerStyles
    >
      <TableBestScorers class="h-full w-full bg-white overflow-y-auto" currentSeason />
    </Layout>
  );
}
