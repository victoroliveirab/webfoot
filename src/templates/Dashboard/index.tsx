import { type Component, useContext, Show } from "solid-js";

import Layout from "@webfoot/components/Layout";
import useDevModeUI from "@webfoot/hooks/useDevModeUI";

import DashboardTableOfPlayers from "./components/TableOfPlayers";
import Grid from "./components/Grid";
import Modals from "./components/Modals";
import NavBar from "./components/NavBar";
import NextOpponent from "./components/NextOpponent";
import TabManager from "./components/TabManager";
import TrainerInfo from "./components/TrainerInfo";
import ClubProvider, { ClubContext } from "./contexts/club";
import FixtureProvider, { FixtureContext } from "./contexts/fixture";
import LayoutProvider from "./contexts/layout";

const Dashboard: Component = () => {
  const club = useContext(ClubContext);
  const fixture = useContext(FixtureContext);
  useDevModeUI();

  const ready = () => club().ready && fixture().ready;

  return (
    <Show when={ready()}>
      <Layout class="w-full" title={() => club().team!.fullname} menu={<NavBar />}>
        <Grid>
          <TrainerInfo />
          <NextOpponent />
          <DashboardTableOfPlayers />
          <TabManager />
        </Grid>
      </Layout>
      <Modals />
    </Show>
  );
};

export default () => (
  <ClubProvider>
    <FixtureProvider>
      <LayoutProvider>
        <Dashboard />
      </LayoutProvider>
    </FixtureProvider>
  </ClubProvider>
);
