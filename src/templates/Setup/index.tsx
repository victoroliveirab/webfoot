import { onMount, type Component, createSignal, createResource } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

import Button from "@webfoot/components/Button";
import Layout from "@webfoot/components/Layout";
import TeamBlock from "@webfoot/components/TeamBlock";
import bootstrap from "@webfoot/core/db/bootstrap";
import { GameLoop, Team, Trainer } from "@webfoot/core/models";
import useSimulateSeason from "@webfoot/hooks/useSimulateSeason";

const MAX_NUMBER_OF_PLAYERS = 6;

type LocationState = {
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
    const elements = document.querySelectorAll<HTMLInputElement>("input[type='text']");
    // For now, let's just create one trainer
    let name = "TRAINER";
    for (const input of elements) {
      if (input.value) {
        name = input.value.trim().toUpperCase();
        break;
      }
    }
    await bootstrap(saveName, startSeason, [name]);
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
          <Button
            class="style-98 default h-16 px-4 w-auto font-bold"
            onClick={uiState() === "create-trainer" ? submitCreation : submitStartGame}
          >
            {uiState() === "create-trainer" ? "Sortear Equipas" : "Jogar"}
          </Button>
          {uiState() === "submit" && (
            <Button class="style-98 default h-16 px-4 w-auto font-bold" onClick={simulateSeason}>
              Simulate Season
            </Button>
          )}
        </div>
      }
    >
      <div
        role="table"
        class="h-full mx-2 mt-2 px-2 py-4 flex flex-col gap-2 border border-black text-sm"
      >
        <div role="row" class="flex items-center gap-4">
          <p role="cell" class="w-16"></p>
          <h2 role="cell" class="w-32">
            Nome
          </h2>
          <h2 role="cell">Equipa</h2>
        </div>
        {Array.from({ length: MAX_NUMBER_OF_PLAYERS }).map((_, i) => (
          <div role="row" class="flex items-center gap-4">
            <p role="cell" class="w-16">
              Jogador {i + 1}
            </p>
            <div role="cell" class="w-32">
              <input
                type="text"
                class="style-98 w-full focus:!bg-w3c-yellow uppercase"
                id={`player-${i}`}
                name={`player-${i}`}
              />
            </div>
            <div role="cell" class="flex-1">
              {i === 0 && team.state === "ready" && (
                <TeamBlock background={team().background} foreground={team().foreground}>
                  {team().name}
                </TeamBlock>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Setup;
