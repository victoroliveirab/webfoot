import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { Fixture } from "../db/types";

class FixtureORM extends ORM<Fixture["type"], Fixture["indexes"]> {
  constructor() {
    super(TABLE_NAMES.Fixture);
    super.observeNewConnections(this);
  }
}

export default new FixtureORM();
