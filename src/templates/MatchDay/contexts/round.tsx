import { type ParentProps, createContext, createResource } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

import { Championship, Fixture, GameLoop, Player, Team } from "@webfoot/core/models";
import type { IChampionship, IFixture, IPlayer, ITeam, ITrainer } from "@webfoot/core/models/types";
import useDBReady from "@webfoot/hooks/useDBReady";
import { arrayToHashMap, groupBy } from "@webfoot/utils/array";
import type { Context, HashMap } from "@webfoot/utils/types";

export type IRoundContext = Context<{
  fixtures: Record<IChampionship["id"], HashMap<IFixture>>;
  players: Record<ITeam["id"], IPlayer[]>;
  teams: HashMap<ITeam>;
}>;

export const RoundContext = createContext<IRoundContext>(() => ({
  fixtures: null,
  players: null,
  ready: false as const,
  teams: null,
}));

type LocationState = {
  squadsByTrainer: Record<
    ITrainer["id"],
    {
      squad: {
        firstTeam: IPlayer["id"][];
        substitutes: IPlayer["id"][];
      };
      teamId: ITeam["id"];
    }
  >;
};

export default function RoundProvider(props: ParentProps) {
  const navigate = useNavigate();
  const { state } = useLocation<LocationState>();
  const year = GameLoop.getYear()!;
  const round = GameLoop.getWeek()!;

  if (!state || !state.squadsByTrainer) {
    console.error("Expected state to have an object of squads by human trainer, found:", state);
    navigate("/");
    return;
  }
  if (!year || !round) {
    console.error("Game not set properly", { round, year });
    navigate("/");
    return;
  }

  const dbReady = useDBReady();
  const [championships] = createResource(dbReady, async () =>
    Championship.getMultipleByIndex("season", year),
  );
  const [fixtures] = createResource(championships, async () => {
    const fixturesByChampionships = await Promise.all(
      championships()!.map((championship) =>
        Fixture.getFixturesByChampionshipIdAndRound(championship.id, round),
      ),
    );
    return fixturesByChampionships.reduce<
      Record<IChampionship["id"], Record<IFixture["id"], IFixture>>
    >(
      (acc, fixturesOfChampionship) => ({
        ...acc,
        [fixturesOfChampionship[0].championshipId]: arrayToHashMap(fixturesOfChampionship),
      }),
      {},
    );
  });
  const [teams] = createResource(fixtures, async () => {
    const teamsIds: ITeam["id"][] = [];
    for (const fixturesByChampionships of Object.values(fixtures()!)) {
      for (const fixture of Object.values(fixturesByChampionships)) {
        teamsIds.push(fixture.homeId);
        teamsIds.push(fixture.awayId);
      }
    }
    const teams = await Team.getMultipleByIds(teamsIds);
    return arrayToHashMap(teams);
  });

  const [players] = createResource(dbReady, async () => {
    const allPlayers = await Player.getAll();
    return groupBy(allPlayers, (player) => player.teamId);
  });

  const signal: IRoundContext = () =>
    players.state === "ready" && teams.state === "ready"
      ? {
          fixtures: fixtures()!,
          ready: true,
          players: players()!,
          teams: teams()!,
        }
      : {
          fixtures: null,
          players: null,
          ready: false,
          teams: null,
        };

  return <RoundContext.Provider value={signal}>{props.children}</RoundContext.Provider>;
}
