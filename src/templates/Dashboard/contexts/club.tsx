import { type ParentProps, createContext, createResource } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";

import { Championship, GameLoop, Player, Team, Trainer } from "@webfoot/core/models";
import type { IChampionship, IPlayer, ITeam, ITrainer } from "@webfoot/core/models/types";
import useDBReady from "@webfoot/hooks/useDBReady";
import type { Context } from "@webfoot/utils/types";

export type IClubContext = Context<{
  championship: IChampionship;
  players: IPlayer[];
  team: ITeam;
  trainer: ITrainer;
}>;

export const ClubContext = createContext<IClubContext>(() => ({
  championship: null,
  players: null,
  ready: false as const,
  team: null,
  trainer: null,
}));

export default function DataProvider(props: ParentProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const dbReady = useDBReady();
  const week = GameLoop.getWeek();
  const year = GameLoop.getYear();

  if (!week || !year) {
    console.error("Game not set properly", { week, year });
    navigate("/");
    return;
  }

  const [trainer] = createResource(dbReady, async () => {
    const trainer = await Trainer.getById(+id);
    if (!trainer.human) {
      navigate("/");
    }
    return trainer;
  });
  const [team] = createResource(trainer, async () => Team.getById(trainer()!.teamId!));
  const [players] = createResource(trainer, async () =>
    Player.getMultipleByIndex("teamId", trainer()!.teamId!),
  );
  const [championship] = createResource(team, async () =>
    Championship.getById(team()!.championshipId!),
  );

  const signal: IClubContext = () =>
    players.state === "ready" && championship.state === "ready"
      ? {
          championship: championship()!,
          players: players()!,
          ready: true,
          team: team()!,
          trainer: trainer()!,
        }
      : {
          championship: null,
          players: null,
          ready: false,
          team: null,
          trainer: null,
        };

  return <ClubContext.Provider value={signal}>{props.children}</ClubContext.Provider>;
}
