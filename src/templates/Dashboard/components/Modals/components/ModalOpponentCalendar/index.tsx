import { useContext } from "solid-js";

import Calendar from "@webfoot/components/Calendar";
import Layout from "@webfoot/components/Layout";

import { FixtureContext } from "../../../../contexts/fixture";
import { LayoutContext } from "../../../../contexts/layout";

export default function ModalOpponentCalendar() {
  const fixture = useContext(FixtureContext);
  const {
    handlers: { setModalOpponentCalendarOpened },
  } = useContext(LayoutContext);

  return (
    <Layout
      title={() => "Calendário"}
      class="w-[480px] h-fit"
      withContainerStyles
      onClickClose={() => setModalOpponentCalendarOpened(false)}
    >
      <Calendar team={() => fixture().opponent!} />
    </Layout>
  );
}
