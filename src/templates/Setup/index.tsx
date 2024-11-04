import { onMount, type Component, createSignal, createResource, Switch, Match } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

import Button from "@webfoot/components/Button";
import Layout from "@webfoot/components/Layout";
import TeamBlock from "@webfoot/components/TeamBlock";
import bootstrap from "@webfoot/core/db/bootstrap";
import { GameLoop, Team, Trainer } from "@webfoot/core/models";
import useSimulateSeason from "@webfoot/hooks/useSimulateSeason";

type LocationState = {
  devMode: boolean;
  name: string;
  year: number;
};

const Setup: Component = () => {
  const navigate = useNavigate();
  const { state } = useLocation<LocationState>();
  if (!state || !state.name || !state.year) {
    navigate("/");
    console.error("Expected state to have name and year, found:", state);
    return;
  }
  const [uiState, setUiState] = createSignal<"create-trainer" | "submit">("create-trainer");
  const [loadTeam, setLoadTeam] = createSignal(false);
  const [team] = createResource(loadTeam, async () => {
    const trainer = await Trainer.getById(1);
    return Team.getById(trainer.teamId!);
  });

  const simulateSeason = useSimulateSeason({
    numberOfSeasons: 10,
    yearGetter: () => GameLoop.getYear()!,
  });

  const saveName = state.name;
  const startSeason = state.year;

  onMount(() => {
    document.getElementById("player-0")?.focus();
  });

  async function submitCreation() {
    const element = document.querySelector<HTMLInputElement>("input[name='player']");
    if (!element) return;
    const name = element.value.trim();
    await bootstrap(saveName, startSeason, name, state?.devMode);
    setLoadTeam(true);
    setUiState("submit");
  }

  function submitStartGame() {
    navigate("/dashboard/1");
  }

  return (
    <Layout
      class="w-[480px]"
      title={() => "Jogadores"}
      actions={
        <div class="flex gap-4 mt-4">
          <Switch>
            <Match when={uiState() === "create-trainer"}>
              <Button class="style-98 default h-16 px-4 w-32 font-bold" onClick={submitCreation}>
                Sortear Equipas
              </Button>
            </Match>
            <Match when={uiState() === "submit"}>
              <Button class="style-98 default h-16 px-4 w-32 font-bold" onClick={submitStartGame}>
                Jogar
              </Button>
              <Button class="style-98 default h-16 px-4 w-32 font-bold" onClick={simulateSeason}>
                Simulate Season
              </Button>
            </Match>
          </Switch>
        </div>
      }
    >
      <div role="table" class="mx-2 mt-2 px-2 py-4 flex flex-col gap-2 border border-black text-sm">
        <div role="row" class="flex items-center gap-4">
          <p role="cell" class="w-16"></p>
          <h2 role="cell" class="w-32">
            Nome
          </h2>
          <h2 role="cell">Equipa</h2>
        </div>
        <div role="row" class="flex items-center gap-4">
          <p role="cell" class="w-16">
            Jogador
          </p>
          <div role="cell" class="w-32">
            <input
              type="text"
              class="style-98 w-full focus:!bg-w3c-yellow"
              id="player"
              name="player"
              value="player"
            />
          </div>
          <div role="cell" class="flex-1">
            {team.state === "ready" && (
              <TeamBlock background={team().background} foreground={team().foreground}>
                {team().name}
              </TeamBlock>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Setup;
