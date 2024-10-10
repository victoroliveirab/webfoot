import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { Standing } from "../db/types";

class StandingORM extends ORM<Standing["type"], Standing["indexes"]> {
  constructor() {
    super(TABLE_NAMES.Standing);
    super.observeNewConnections(this);
  }
}

export default new StandingORM();
