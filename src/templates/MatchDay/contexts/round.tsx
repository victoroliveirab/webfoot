import { type ParentProps, createContext, createResource } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

import { pickSquadRandomly } from "@webfoot/core/engine/pickers/squad";
import Simulator from "@webfoot/core/engine/simulator";
import { Championship, Fixture, GameLoop, Player, Team } from "@webfoot/core/models";
import type { IChampionship, IFixture, IPlayer, ITeam, ITrainer } from "@webfoot/core/models/types";
import useDBReady from "@webfoot/hooks/useDBReady";
import { arrayToHashMap } from "@webfoot/utils/array";
import type { Context, HashMap } from "@webfoot/utils/types";

export type IRoundContext = Context<{
  initialSquads: Record<
    IFixture["id"],
    { away: Simulator["awaySquadRecord"]; home: Simulator["homeSquadRecord"] }
  >;
  fixtures: Record<IChampionship["id"], HashMap<IFixture>>;
  teams: HashMap<ITeam>;
}>;

export const RoundContext = createContext<IRoundContext>(() => ({
  initialSquads: null,
  fixtures: null,
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
  const trainersTeams = Object.values(state.squadsByTrainer);

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
  const [squads] = createResource(teams, async () => {
    const squads: Record<
      IFixture["id"],
      { away: Simulator["awaySquadRecord"]; home: Simulator["homeSquadRecord"] }
    > = {};
    const allChampionshipsIds = Object.keys(fixtures()!);
    for (const championshipId of allChampionshipsIds) {
      const allFixtures = fixtures()![+championshipId];
      for (const fixture of Object.values(allFixtures)) {
        const homeTeam = teams()![fixture.homeId];
        const awayTeam = teams()![fixture.awayId];

        const trainerHomeTeam = trainersTeams.find(({ teamId }) => teamId === homeTeam.id);
        const trainerAwayTeam = trainersTeams.find(({ teamId }) => teamId === awayTeam.id);

        let homeTeamSquad: Simulator["awaySquadRecord"];
        let awayTeamSquad: Simulator["homeSquadRecord"];

        if (trainerHomeTeam) {
          const players = await Player.getMultipleByIds([
            ...trainerHomeTeam.squad.firstTeam,
            ...trainerHomeTeam.squad.substitutes,
          ]);
          const playersHashMap = arrayToHashMap(players);
          homeTeamSquad = {
            playing: trainerHomeTeam.squad.firstTeam.map((id) => playersHashMap[id]),
            bench: trainerHomeTeam.squad.substitutes.map((id) => playersHashMap[id]),
            out: [],
          };
        } else {
          const allPlayersOfHomeTeam = await Player.getMultipleByIndex("teamId", homeTeam.id);
          const squad = pickSquadRandomly(allPlayersOfHomeTeam);
          homeTeamSquad = {
            playing: squad.firstTeam,
            bench: squad.substitutes,
            out: [],
          };
        }

        if (trainerAwayTeam) {
          const players = await Player.getMultipleByIds([
            ...trainerAwayTeam.squad.firstTeam,
            ...trainerAwayTeam.squad.substitutes,
          ]);
          const playersHashMap = arrayToHashMap(players);
          awayTeamSquad = {
            playing: trainerAwayTeam.squad.firstTeam.map((id) => playersHashMap[id]),
            bench: trainerAwayTeam.squad.substitutes.map((id) => playersHashMap[id]),
            out: [],
          };
        } else {
          const allPlayersOfAwayTeam = await Player.getMultipleByIndex("teamId", awayTeam.id);
          const squad = pickSquadRandomly(allPlayersOfAwayTeam);
          awayTeamSquad = {
            playing: squad.firstTeam,
            bench: squad.substitutes,
            out: [],
          };
        }

        await Fixture.update({
          ...fixture,
          homeSquad: {
            firstTeam: homeTeamSquad.playing.map(({ id }) => id),
            substitutes: homeTeamSquad.bench.map(({ id }) => id),
          },
          awaySquad: {
            firstTeam: awayTeamSquad.playing.map(({ id }) => id),
            substitutes: awayTeamSquad.bench.map(({ id }) => id),
          },
        });

        squads[fixture.id] = {
          away: awayTeamSquad,
          home: homeTeamSquad,
        };
      }
    }
    return squads;
  });

  const signal: IRoundContext = () =>
    squads.state === "ready"
      ? {
          initialSquads: squads()!,
          fixtures: fixtures()!,
          ready: true,
          teams: teams()!,
        }
      : {
          initialSquads: null,
          fixtures: null,
          ready: false,
          teams: null,
        };

  return <RoundContext.Provider value={signal}>{props.children}</RoundContext.Provider>;
}
