import { type Component } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Layout from "@webfoot/components/Layout";
import Standings from "@webfoot/components/Standings";
import { GameLoop } from "@webfoot/core/models";

const StandingsPage: Component = () => {
  const navigate = useNavigate();
  const week = GameLoop.getWeek();
  const year = GameLoop.getYear();

  if (!week || !year) {
    navigate("/");
    return;
  }

  function submitContinue() {
    GameLoop.setWeek(week! + 1);
    GameLoop.updateCurrentSave();
    navigate("/dashboard/1");
  }

  return (
    <>
      <Layout class="w-[800px] h-[480px]" title={() => `${week}ª  Jornada`}>
        <Standings onClose={submitContinue} year={year} />
      </Layout>
    </>
  );
};

export default StandingsPage;
