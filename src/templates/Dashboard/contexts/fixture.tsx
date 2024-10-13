import { type ParentProps, createContext, createResource, useContext } from "solid-js";

import { Fixture, GameLoop, Standing, Team, Trainer } from "@webfoot/core/models";
import type { IFixture, IStanding, ITeam, ITrainer } from "@webfoot/core/models/types";
import type { Context } from "@webfoot/utils/types";

import { ClubContext } from "./club";

type Venue = "H" | "A";

export type IFixtureContext = Context<{
  fixture: IFixture;
  opponent: ITeam;
  opponentTrainer: ITrainer;
  standings: Record<Venue, IStanding>;
  venue: Venue;
}>;

export const FixtureContext = createContext<IFixtureContext>(() => ({
  fixture: null,
  opponent: null,
  opponentTrainer: null,
  ready: false as const,
  standings: null,
  venue: null,
}));

export default function FixtureProvider(props: ParentProps) {
  const club = useContext(ClubContext);
  const clubReady = () => club().ready;
  const round = GameLoop.getWeek()!;

  const [fixture] = createResource(clubReady, async () => {
    const teamId = club().team!.id;
    const championshipId = club().team!.championshipId!;
    const fixtures = await Fixture.getFixturesByChampionshipIdAndRound(championshipId, round);
    return fixtures.find(({ awayId, homeId }) => awayId === teamId || homeId === teamId)!;
  });

  const venue = () =>
    fixture.state === "ready" ? (fixture()!.homeId === club().team!.id ? "H" : "A") : null;

  const [opponent] = createResource(fixture, async () => {
    const teamId = club().team!.id;
    const opponentId = teamId === fixture()!.homeId ? fixture()!.awayId : fixture()!.homeId;
    return Team.getById(opponentId);
  });

  const [opponentTrainer] = createResource(opponent, async () => {
    const [trainer] = await Trainer.getMultipleByIndex("teamId", opponent()!.id);
    return trainer;
  });

  const [standings] = createResource(opponent, async () => {
    const teamStanding = await Standing.getTeamStandingByChampionshipId(
      club().team!.id,
      club().team!.championshipId!,
    );
    const opponentStanding = await Standing.getTeamStandingByChampionshipId(
      opponent()!.id,
      opponent()!.championshipId!,
    );

    return {
      A: venue() === "A" ? teamStanding : opponentStanding,
      H: venue() === "H" ? teamStanding : opponentStanding,
    };
  });

  const signal: IFixtureContext = () =>
    standings.state === "ready"
      ? {
          fixture: fixture()!,
          opponent: opponent()!,
          opponentTrainer: opponentTrainer()!,
          ready: true,
          standings: standings()!,
          venue: venue()!,
        }
      : {
          fixture: null,
          opponent: null,
          opponentTrainer: null,
          ready: false,
          standings: null,
          venue: null,
        };

  return <FixtureContext.Provider value={signal}>{props.children}</FixtureContext.Provider>;
}
