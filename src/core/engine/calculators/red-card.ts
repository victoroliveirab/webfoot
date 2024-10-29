import type { IPlayer } from "@webfoot/core/models/types";

import { DISCIPLINE_THRESHOLD, RED_CARD_THRESHOLD } from "./constants";

export default function calculateRedCardPlayer(player: IPlayer): boolean {
  const sentOffProbability =
    (RED_CARD_THRESHOLD * (DISCIPLINE_THRESHOLD - player.discipline)) / DISCIPLINE_THRESHOLD;
  return Math.random() < sentOffProbability;
}
