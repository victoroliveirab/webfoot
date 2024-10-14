import { type Component, createEffect, Show, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Button from "@webfoot/components/Button";
import Layout from "@webfoot/components/Layout";
import connect from "@webfoot/core/db/connect";
import useAvailableSaves from "@webfoot/hooks/useAvailableSaves";
import { GameLoop } from "@webfoot/core/models";

import styles from "./styles.module.css";

const Home: Component = () => {
  const navigate = useNavigate();
  const saves = useAvailableSaves();
  const [isNewGame, setIsNewGame] = createSignal(true);
  const currentSave = GameLoop.getCurrentSave();

  createEffect(async () => {
    if (saves.state === "ready" && currentSave && saves().includes(currentSave)) {
      await connect({
        name: currentSave,
      });
      navigate("/dashboard/1");
    }
  });

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const radioChoice = formData.get("choice");
    if (radioChoice === "continue") {
      const loadGameName = formData.get("savedgames")?.toString();
      if (!loadGameName) return;
      await connect({
        name: loadGameName,
      });
      GameLoop.loadSave(loadGameName);
      navigate("/dashboard/1");
    } else if (radioChoice === "newgame") {
      const newSaveName = formData.get("newgame-name")?.toString();
      if (!newSaveName || saves()!.includes(newSaveName)) return;
      const year = new Date().getFullYear();
      navigate("/setup", {
        state: {
          name: newSaveName,
          year,
        },
      });
    }
  }

  return (
    <Layout class="w-[640px] !bg-w3c-green" title={() => "Webfoot"}>
      <Show when={saves.state === "errored"}>
        <p>
          Your browser seem to not support IndexedDB. You can try to use Firefox or Google Chrome.
        </p>
      </Show>
      <Show when={saves.state === "ready"}>
        <div class="pl-2 pr-4 py-2 flex w-full gap-5">
          <form class="flex gap-6 w-full border border-white px-4 py-8" onSubmit={submit}>
            <div class="flex-1 border border-white p-4">
              <fieldset class="mb-8">
                <div class="flex gap-2 mb-4 field-row">
                  <input
                    class="style-98"
                    type="radio"
                    name="choice"
                    id="newgame"
                    value="newgame"
                    checked={isNewGame()}
                    onChange={() => setIsNewGame(true)}
                  />
                  <label for="newgame" class="font-bold text-w3c-darkblue">
                    Quero começar um jogo do início
                  </label>
                </div>
                <div class="flex justify-end gap-2">
                  <label for="newgame-name" class="text-nowrap font-bold text-w3c-yellow">
                    Nome do ficheiro (8 letras):
                  </label>
                  <input
                    type="text"
                    name="newgame-name"
                    id="newgame-name"
                    class="style-98 flex-1 max-w-40"
                    disabled={!isNewGame()}
                  />
                </div>
              </fieldset>
              <fieldset class="flex-1">
                <div class="flex gap-2 mb-4">
                  <input
                    class="style-98"
                    type="radio"
                    name="choice"
                    id="continue"
                    value="continue"
                    checked={!isNewGame()}
                    onChange={() => setIsNewGame(false)}
                  />
                  <label for="continue" class="text-nowrap font-bold text-w3c-darkblue">
                    Quero continuar um jogo
                  </label>
                </div>
                <div class="flex items-start gap-2 ml-16">
                  <label for="savedgames" class="font-bold text-w3c-yellow">
                    Jogos gravados:
                  </label>
                  <select
                    size={8}
                    id="savedgames"
                    name="savedgames"
                    class={`style-98 ${styles.select}`}
                    disabled={isNewGame()}
                  >
                    {saves()!.map((save: string) => (
                      <option value={save}>{save}</option>
                    ))}
                  </select>
                </div>
              </fieldset>
            </div>
            <div class="flex flex-col gap-4">
              <Button class="style-98" type="submit">
                OK
              </Button>
              <Button
                class="style-98"
                onClick={(e) => {
                  e.preventDefault();
                  for (const save of saves()!) {
                    indexedDB.deleteDatabase(save);
                  }
                }}
              >
                Delete databases
              </Button>
            </div>
          </form>
        </div>
      </Show>
    </Layout>
  );
};

export default Home;
