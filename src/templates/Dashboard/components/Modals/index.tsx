import { useContext } from "solid-js";

import Modal from "@webfoot/components/Modal";

import ModalExplore from "./components/ModalExplore";
import ModalOpponentTrainerHistory from "./components/ModalOpponentTrainerHistory";
import ModalTrainerHistory from "./components/ModalTrainerHistory";
import ModalOpponentCalendar from "./components/ModalOpponentCalendar";
import ModalCalendar from "./components/ModalCalendar";
import ModalBestScorersSeason from "./components/ModalBestScorersSeason";
import ModalStandings from "./components/ModalStandings";
import { LayoutContext } from "../../contexts/layout";

// OPTIMIZE: lazy load most of these infos
const Modals = () => {
  const {
    values: {
      modalBestScorersSeasonOpened,
      modalCalendarTeamOpened,
      modalOpponentCalendarOpened,
      modalOpponentTrainerHistoryOpened,
      modalStandingsOpened,
      modalTrainerHistoryOpened,
      visibleTeam,
    },
  } = useContext(LayoutContext);

  return (
    <>
      <Modal show={modalStandingsOpened} class="z-10">
        <ModalStandings />
      </Modal>
      <Modal show={modalBestScorersSeasonOpened} class="z-10">
        <ModalBestScorersSeason />
      </Modal>
      <Modal show={modalCalendarTeamOpened} class="z-10">
        <ModalCalendar />
      </Modal>
      <Modal show={modalOpponentCalendarOpened} class="z-10">
        <ModalOpponentCalendar />
      </Modal>
      <Modal show={modalTrainerHistoryOpened} class="z-10">
        <ModalTrainerHistory />
      </Modal>
      <Modal show={modalOpponentTrainerHistoryOpened} class="z-10">
        <ModalOpponentTrainerHistory />
      </Modal>
      <Modal show={visibleTeam} class="z-30">
        <ModalExplore />
      </Modal>
    </>
  );
};

export default Modals;
