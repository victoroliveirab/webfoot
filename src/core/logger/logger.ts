import { TABLE_NAMES } from "../db/constants";
import ORM from "../db/orm";
import type { ORMBlueprint, Story } from "../db/types";
import type Simulator from "../engine/simulator";
import { GameLoop } from "../models";
import type { IPlayer, ITeam, ITrainer } from "../models/types";

type PlayerChangeRecord = {
  type: "PLAYER_CHANGE_RECORD";
  data: {
    before: string;
    after: string;
  };
};

type SimulationStoryRecord = {
  type: "SIMULATION_STORY_RECORD";
  data: {
    player: string;
    simulator: string;
    story: string;
  };
};

type SquadCreationRecord = {
  type: "SQUAD_CREATION_RECORD";
  data: {
    players: string;
    teamId: number;
  };
};

type TrainerCreationRecord = {
  type: "TRAINER_CREATION_RECORD";
  data: {
    trainer: string;
  };
};

type LogRecordType =
  | PlayerChangeRecord
  | SimulationStoryRecord
  | SquadCreationRecord
  | TrainerCreationRecord;

export type Logger = ORMBlueprint<
  {
    id: number;
    timestamp: string;
  } & LogRecordType,
  "type"
>;

const timestamp = () => new Date().toISOString();

export default class LoggerORM extends ORM<Logger["type"], Logger["indexes"]> {
  private enabled: boolean = false;
  constructor() {
    super(TABLE_NAMES.Logs);
    super.observeNewConnections(this);
  }

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  assignDbConnection(connection: IDBDatabase) {
    super.assignDbConnection(connection);
    const devModeEnabled = GameLoop.getDevMode();
    this.enabled = devModeEnabled;
  }

  async logPlayerChanged(before: Partial<IPlayer>, after: Partial<IPlayer>) {
    if (!this.enabled) return;
    await this.add({
      type: "PLAYER_CHANGE_RECORD",
      data: {
        before: JSON.stringify(before),
        after: JSON.stringify(after),
      },
      timestamp: timestamp(),
    });
  }

  async logTrainerCreation(trainer: ITrainer) {
    if (!this.enabled) return;
    await this.add({
      type: "TRAINER_CREATION_RECORD",
      data: {
        trainer: JSON.stringify(trainer),
      },
      timestamp: timestamp(),
    });
  }

  async logSquadCreation(teamId: ITeam["id"], players: IPlayer[]) {
    if (!this.enabled) return;
    await this.add({
      type: "SQUAD_CREATION_RECORD",
      data: {
        players: JSON.stringify(players),
        teamId,
      },
      timestamp: timestamp(),
    });
  }

  async logSimulationStory(simulator: Simulator, player: IPlayer, story: Story) {
    if (!this.enabled) return;
    await this.add({
      type: "SIMULATION_STORY_RECORD",
      data: {
        player: JSON.stringify(player),
        simulator: JSON.stringify(simulator),
        story: JSON.stringify(story),
      },
      timestamp: timestamp(),
    });
  }
}
