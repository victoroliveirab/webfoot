import { useContext } from "solid-js";

import Calendar from "@webfoot/components/Calendar";
import Layout from "@webfoot/components/Layout";

import { ClubContext } from "../../../../contexts/club";
import { LayoutContext } from "../../../../contexts/layout";

export default function ModalCalendar() {
  const club = useContext(ClubContext);
  const {
    handlers: { setModalCalendarTeamOpened },
  } = useContext(LayoutContext);

  return (
    <Layout
      title={() => "Calendário"}
      class="w-[480px] h-fit"
      withContainerStyles
      onClickClose={() => setModalCalendarTeamOpened(false)}
    >
      <Calendar team={() => club().team!} />
    </Layout>
  );
}
