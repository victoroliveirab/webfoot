import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { Standing } from "../db/types";

class StandingORM extends ORM<Standing["type"], Standing["indexes"]> {
  constructor() {
    super(TABLE_NAMES.Standing);
    super.observeNewConnections(this);
  }

  async getTeamStandingByChampionshipId(
    teamId: Standing["type"]["teamId"],
    championshipId: Standing["type"]["championshipId"],
  ) {
    const standings = await this.getMultipleByIndex("teamId", teamId);
    return standings.find((standing) => standing.championshipId === championshipId)!;
  }
}

export default new StandingORM();
