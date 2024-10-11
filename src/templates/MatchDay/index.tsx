import { type Component } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

import type { IPlayer, ITeam, ITrainer } from "@webfoot/core/models/types";

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

const MatchDay: Component = () => {
  const navigate = useNavigate();
  const { state } = useLocation<LocationState>();
  if (!state || !state.squadsByTrainer) {
    navigate("/");
    console.error("Expected state to have an object of squads by human trainer, found:", state);
    return;
  }
  console.log(state);

  return <p>Match Day</p>;
};

export default MatchDay;
