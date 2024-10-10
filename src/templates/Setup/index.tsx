import { onMount, type Component } from "solid-js";

import Layout from "@webfoot/components/Layout";
import Button from "@webfoot/components/Button";

const MAX_NUMBER_OF_PLAYERS = 6;

const Setup: Component = () => {
  onMount(() => {
    document.getElementById("player-0")?.focus();
  });

  async function submit() {
    console.log("submit");
  }

  return (
    <Layout
      class="w-[480px]"
      title={() => "Jogadores"}
      actions={
        <Button class="mt-4 style-98 default h-16 px-4 w-auto font-bold" onClick={submit}>
          Sortear Equipas
        </Button>
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
            <div role="cell" class="flex-1 bg-indigo-500"></div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Setup;
