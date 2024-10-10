import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { League } from "../db/types";

class LeagueORM extends ORM<League["type"], League["indexes"]> {
  constructor() {
    super(TABLE_NAMES.League);
    super.observeNewConnections(this);
  }
}

export default new LeagueORM();
