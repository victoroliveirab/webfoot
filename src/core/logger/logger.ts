import { TABLE_NAMES } from "../db/constants";
import ORM from "../db/orm";
import type { ORMBlueprint, Story } from "../db/types";
import type Simulator from "../engine/simulator";
import { GameLoop } from "../models";
import type { IPlayer } from "../models/types";

type SimulationStoryRecord = {
  type: "SIMULATION_STORY_RECORD";
  data: {
    player: string;
    simulator: string;
    story: string;
  };
};

type LogRecordType = SimulationStoryRecord;

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

  assignDbConnection(connection: IDBDatabase) {
    console.log("HERE");
    super.assignDbConnection(connection);
    const devModeEnabled = GameLoop.getDevMode();
    console.log({ devModeEnabled });
    this.enabled = devModeEnabled;
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
