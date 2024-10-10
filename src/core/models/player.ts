import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { Player } from "../db/types";

class PlayerORM extends ORM<Player["type"], Player["indexes"]> {
  constructor() {
    super(TABLE_NAMES.Player);
    super.observeNewConnections(this);
  }
}

export default new PlayerORM();
