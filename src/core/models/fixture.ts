import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { Fixture } from "../db/types";

class FixtureORM extends ORM<Fixture["type"], Fixture["indexes"]> {
  constructor() {
    super(TABLE_NAMES.Fixture);
    super.observeNewConnections(this);
  }

  async getFixturesByChampionshipIdAndRound(
    championshipId: Fixture["type"]["championshipId"],
    round: Fixture["type"]["round"],
  ) {
    const allFixtures = await this.getMultipleByIndex("championshipId", championshipId);
    return allFixtures.filter((fixture) => fixture.round === round);
  }
}

export default new FixtureORM();
