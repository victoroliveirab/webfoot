import { useContext } from "solid-js";

import Layout from "@webfoot/components/Layout";
import TrainerHistory from "@webfoot/components/TrainerHistory";

import { LayoutContext } from "../../../../contexts/layout";
import { FixtureContext } from "../../../../contexts/fixture";

export default function ModalOpponentTrainerHistory() {
  const fixture = useContext(FixtureContext);
  const {
    handlers: { setModalOpponentTrainerHistoryOpened },
  } = useContext(LayoutContext);

  return (
    <Layout
      title={() => fixture().opponentTrainer!.name}
      class="h-[320px] w-[360px]"
      onClickClose={() => setModalOpponentTrainerHistoryOpened(false)}
      withContainerStyles
    >
      <TrainerHistory class="bg-white h-full" trainerId={() => fixture().opponentTrainer!.id} />
    </Layout>
  );
}
