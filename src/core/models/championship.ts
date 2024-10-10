import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { Championship } from "../db/types";

class ChampionshipORM extends ORM<Championship["type"], Championship["indexes"]> {
  constructor() {
    super(TABLE_NAMES.Championship);
    super.observeNewConnections(this);
  }
}

export default new ChampionshipORM();
