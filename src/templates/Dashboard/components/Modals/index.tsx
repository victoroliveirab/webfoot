import { useContext } from "solid-js";

import Calendar from "@webfoot/components/Calendar";
import Layout from "@webfoot/components/Layout";
import Modal from "@webfoot/components/Modal";
import Standings from "@webfoot/components/Standings";
import TrainerHistory from "@webfoot/components/TrainerHistory";
import TableBestScorers from "@webfoot/components/TableBestScorers";
import { GameLoop } from "@webfoot/core/models";

import { ClubContext } from "../../contexts/club";
import { FixtureContext } from "../../contexts/fixture";
import { LayoutContext } from "../../contexts/layout";

// OPTIMIZE: lazy load most of these infos
const Modals = () => {
  const club = useContext(ClubContext);
  const fixture = useContext(FixtureContext);
  const {
    handlers: {
      setModalBestScorersSeasonOpened,
      setModalCalendarTeamOpened,
      setModalOpponentCalendarOpened,
      setModalOpponentTrainerHistoryOpened,
      setModalStandingsOpened,
      setModalTrainerHistoryOpened,
    },
    values: {
      modalBestScorersSeasonOpened,
      modalCalendarTeamOpened,
      modalOpponentCalendarOpened,
      modalOpponentTrainerHistoryOpened,
      modalStandingsOpened,
      modalTrainerHistoryOpened,
    },
  } = useContext(LayoutContext);
  const year = GameLoop.getYear()!;

  return (
    <>
      <Modal show={modalStandingsOpened} class="z-10">
        <Layout
          title={() => "Classificação"}
          class="w-[720px]"
          onClickClose={() => setModalStandingsOpened(false)}
        >
          <Standings year={year} />
        </Layout>
      </Modal>
      <Modal show={modalBestScorersSeasonOpened} class="z-10">
        <Layout
          title={() => "Melhores marcadores desta época"}
          class="h-[640px] w-[480px]"
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
      </Modal>
      <Modal show={modalCalendarTeamOpened} class="z-10">
        <Layout
          title={() => "Calendário"}
          class="w-[480px] h-fit"
          withContainerStyles
          onClickClose={() => setModalCalendarTeamOpened(false)}
        >
          <Calendar team={() => club().team!} />
        </Layout>
      </Modal>
      <Modal show={modalOpponentCalendarOpened} class="z-10">
        <Layout
          title={() => "Calendário"}
          class="w-[480px] h-fit"
          withContainerStyles
          onClickClose={() => setModalOpponentCalendarOpened(false)}
        >
          <Calendar team={() => fixture().opponent!} />
        </Layout>
      </Modal>
      <Modal show={modalTrainerHistoryOpened} class="z-10">
        <Layout
          title={() => club().trainer!.name}
          class="h-[320px] w-[360px]"
          onClickClose={() => setModalTrainerHistoryOpened(false)}
          withContainerStyles
        >
          <TrainerHistory class="bg-white h-full" trainerId={() => club().trainer!.id} />
        </Layout>
      </Modal>
      <Modal show={modalOpponentTrainerHistoryOpened} class="z-10">
        <Layout
          title={() => fixture().opponentTrainer!.name}
          class="h-[320px] w-[360px]"
          onClickClose={() => setModalOpponentTrainerHistoryOpened(false)}
          withContainerStyles
        >
          <TrainerHistory class="bg-white h-full" trainerId={() => fixture().opponentTrainer!.id} />
        </Layout>
      </Modal>
    </>
  );
};

export default Modals;
