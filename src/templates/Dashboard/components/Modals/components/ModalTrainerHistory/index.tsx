import { useContext } from "solid-js";

import Layout from "@webfoot/components/Layout";
import TrainerHistory from "@webfoot/components/TrainerHistory";

import { ClubContext } from "../../../../contexts/club";
import { LayoutContext } from "../../../../contexts/layout";

export default function ModalTrainerHistory() {
  const club = useContext(ClubContext);
  const {
    handlers: { setModalTrainerHistoryOpened },
  } = useContext(LayoutContext);

  return (
    <Layout
      title={() => club().trainer!.name}
      class="max-h-[320px] w-[360px]"
      onClickClose={() => setModalTrainerHistoryOpened(false)}
      withContainerStyles
    >
      <TrainerHistory class="bg-white h-full" trainerId={() => club().trainer!.id} />
    </Layout>
  );
}
