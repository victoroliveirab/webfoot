import {
  type Accessor,
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
  useContext,
} from "solid-js";

import Button from "@webfoot/components/Button";
import DivInTeamColors from "@webfoot/components/DivInTeamColors";
import Layout from "@webfoot/components/Layout";
import MoraleProgressBar from "@webfoot/components/MoraleProgressBar";
import PlayerStats from "@webfoot/components/PlayerStats";
import TableOfPlayers from "@webfoot/components/TableOfPlayers";
import { Championship, GameLoop, League, Player, Team } from "@webfoot/core/models";
import type { IChampionship, ILeague, IPlayer, ITeam } from "@webfoot/core/models/types";
import useDBReady from "@webfoot/hooks/useDBReady";
import { arrayToHashMap } from "@webfoot/utils/array";

import { LayoutContext } from "../../../../contexts/layout";
import Frame from "@webfoot/components/Frame";

export default function ModalExplore() {
  const dbReady = useDBReady();
  const {
    handlers: { setVisibleTeam },
    values: { visibleTeam },
  } = useContext(LayoutContext);

  const [teams] = createResource(dbReady, async () => {
    const teams = await Team.getAll();
    teams.sort((teamA, teamB) => (teamA.name < teamB.name ? -1 : 1));
    return teams;
  });
  const [leagues] = createResource(dbReady, async () => {
    const leagues = await League.getAll();
    return arrayToHashMap(leagues);
  });
  const [championships] = createResource(leagues, async () => {
    const championships = await Championship.getMultipleByIndex("season", GameLoop.getYear()!);
    return championships;
  });
  const championshipsNamesById: Accessor<
    Record<IChampionship["id"], ILeague["name"]> | null
  > = () =>
    championships.state === "ready"
      ? championships()!.reduce(
          (acc, championship) => ({
            ...acc,
            [championship.id]: leagues()![championship.leagueId].name,
          }),
          {},
        )
      : null;

  const [team, setTeam] = createSignal<ITeam | null>(null);
  const [selectedPlayer, setSelectedPlayer] = createSignal<IPlayer | null>(null);
  const [players, { refetch: refetchPlayers }] = createResource(async () => {
    if (!team()) return [];
    return Player.getMultipleByIndex("teamId", team()!.id);
  });
  const [dropdownValue, setDropdownValue] = createSignal<ITeam["name"] | null>(null);

  createEffect(() => {
    if (teams.state !== "ready" || !visibleTeam() || visibleTeam() === team()?.id) return;
    const selectedTeam = teams()!.find((team) => team.id === visibleTeam())!;
    setTeam(selectedTeam);
    setDropdownValue(selectedTeam.name);
    refetchPlayers();
  });

  function onDropdownSelectValue(event: Event & { target: HTMLSelectElement }) {
    const {
      target: { value },
    } = event;
    const newVisibleTeam = teams()!.find((team) => team.name === value)!;
    setVisibleTeam(newVisibleTeam.id);
    setDropdownValue(newVisibleTeam.name);
    setSelectedPlayer(null);
  }

  return (
    <Layout
      title={() => `${team()?.fullname} (Brasil)`}
      class="w-[800px] h-[644px]"
      onClickClose={() => setVisibleTeam(null)}
    >
      <Show when={team() && players.state === "ready"}>
        <DivInTeamColors
          class="h-full w-full grid grid-cols-5"
          background={team()!.background}
          foreground={team()!.foreground}
        >
          <div class="col-span-3 flex flex-col pl-2 pb-4">
            <div class="flex gap-2 pt-2 pb-1">
              <select
                class="w-2/3 font-bold bg-white text-black uppercase border border-black focus:outline-none"
                value={dropdownValue() ?? undefined}
                onChange={onDropdownSelectValue}
              >
                <For each={teams()}>{(item) => <option value={item.name}>{item.name}</option>}</For>
              </select>
              <h2>
                {team()
                  ? team()!.championshipId
                    ? championshipsNamesById()?.[team()!.championshipId!]
                    : "Distrital"
                  : null}
              </h2>
            </div>
            <Frame class="flex-1">
              <TableOfPlayers
                class="h-full overflow-y-auto text-sm pl-1"
                background={team()!.background}
                foreground={team()!.foreground}
                players={players()!}
                onClickPlayer={(playerId) =>
                  setSelectedPlayer(players()!.find((player) => player.id === playerId)!)
                }
              />
            </Frame>
          </div>
          <div class="col-span-2 pl-6 pr-8 pt-2 pb-3 flex flex-col justify-between">
            <div class="flex flex-col gap-3 text-sm">
              <MoraleProgressBar morale={team()!.morale} thin />
              <div class="flex justify-between px-3">
                <Button class="style-98">Balanço</Button>
                <Button class="style-98">Calendário</Button>
              </div>
              <div class="flex flex-col gap-2">
                <PlayerStats player={selectedPlayer} team={() => team()!} />
              </div>
            </div>
            <div class="grid grid-cols-3 grid-flow-row w-fit mx-auto">
              <Button class="style-98">Procurar</Button>
              <Button class="style-98">Comprar</Button>
              <Button class="style-98">Empréstimo</Button>
              <Button class="style-98">Observado</Button>
              <Button class="style-98">Lista</Button>
              <Button
                class="style-98"
                onClick={() => {
                  setVisibleTeam(null);
                  setTeam(null);
                  setDropdownValue(null);
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DivInTeamColors>
      </Show>
    </Layout>
  );
}
