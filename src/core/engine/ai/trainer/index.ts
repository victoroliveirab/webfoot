import type { IFixture, ITeam } from "@webfoot/core/models/types";

import StandardAITrainer from "./standard";
import type { AITrainerStrategy } from "../../types";
import type Simulator from "../../simulator";

export type AITrainerParams = {
  getters: {
    fixture: () => IFixture;
    isHomeTeam: () => boolean;
    currentScoreline: () => Simulator["currentScoreline"];
    squad: () => Simulator["homeSquadRecord"] | Simulator["awaySquadRecord"];
    subsLeft: () => Simulator["homeSubsLeft"] | Simulator["awaySubsLeft"];
  };
  teamId: ITeam["id"];
};

export default function aiTrainerFactory(type: AITrainerStrategy, params: AITrainerParams) {
  switch (type) {
    case "Standard": {
      return new StandardAITrainer(params);
    }
  }
}
