import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { SimulationRecord } from "../db/types";

class SimulationRecordORM extends ORM<SimulationRecord["type"], SimulationRecord["indexes"]> {
  constructor() {
    super(TABLE_NAMES.SimulationRecord);
    super.observeNewConnections(this);
  }
}

export default new SimulationRecordORM();
