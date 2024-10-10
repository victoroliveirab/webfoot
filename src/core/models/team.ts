import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { Team } from "../db/types";

class TeamORM extends ORM<Team["type"], Team["indexes"]> {
  constructor() {
    super(TABLE_NAMES.Team);
    super.observeNewConnections(this);
  }
}

export default new TeamORM();
