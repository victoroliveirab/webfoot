import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { Trainer } from "../db/types";

class TrainerORM extends ORM<Trainer["type"], Trainer["indexes"]> {
  constructor() {
    super(TABLE_NAMES.Trainer);
    super.observeNewConnections(this);
  }
}

export default new TrainerORM();
