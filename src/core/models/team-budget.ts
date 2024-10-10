import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { TeamBudget } from "../db/types";

class TeamBudgetORM extends ORM<TeamBudget["type"], TeamBudget["indexes"]> {
  constructor() {
    super(TABLE_NAMES.TeamBudget);
    super.observeNewConnections(this);
  }
}

export default new TeamBudgetORM();
