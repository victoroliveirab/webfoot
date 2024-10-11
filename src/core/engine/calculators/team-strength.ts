import type { IPlayer } from "@webfoot/core/models/types";

import {
  ADJUSTED_ATTACK_ATTACK_MODIFIER,
  ADJUSTED_ATTACK_MIDFIELD_MODIFIER,
  ADJUSTED_DEFENSE_DEFENSE_MODIFIER,
  ADJUSTED_DEFENSE_MIDFIELD_MODIFIER,
  ATTACKER_POWER_MULTIPLIER,
  BASE_MORALE_EFFECT,
  BASE_PLAYER_MULTIPLIER,
  DEFENDER_POWER_MULTIPLIER,
  GOALKEEPER_POWER_MULTIPLIER,
  MIDFIELDER_POWER_MULTIPLIER,
  MORALE_MULTIPLIER,
  STAR_PLAYER_MULTIPLIER,
} from "./constants";

export default function calculateTeamStrength(squad: IPlayer[], morale: number) {
  let attackStrength = 0;
  let defenseStrength = 0;
  let midfieldStrength = 0;

  squad.forEach((player) => {
    const strengthModifier = player.star ? STAR_PLAYER_MULTIPLIER : BASE_PLAYER_MULTIPLIER;
    switch (player.position) {
      case "G": {
        defenseStrength += player.power * GOALKEEPER_POWER_MULTIPLIER;
        break;
      }
      case "D": {
        defenseStrength += player.power * DEFENDER_POWER_MULTIPLIER;
        break;
      }
      case "M": {
        midfieldStrength += player.power * MIDFIELDER_POWER_MULTIPLIER * strengthModifier;
        break;
      }

      case "A": {
        attackStrength += player.power * ATTACKER_POWER_MULTIPLIER * strengthModifier;
        break;
      }

      default: {
        console.error({
          squad,
          player,
          morale,
        });
      }
    }
  });

  const attackStrengthContributionToAttack = ADJUSTED_ATTACK_ATTACK_MODIFIER * attackStrength;
  const midfieldStrenghContributionToAttack = ADJUSTED_ATTACK_MIDFIELD_MODIFIER * midfieldStrength;
  const midfieldStrengthContributionToDefense =
    ADJUSTED_DEFENSE_MIDFIELD_MODIFIER * midfieldStrength;
  const defenseStrengthContributionToDefense = ADJUSTED_DEFENSE_DEFENSE_MODIFIER * defenseStrength;

  const attackFactor = attackStrengthContributionToAttack + midfieldStrenghContributionToAttack;
  const defenseFactor =
    defenseStrengthContributionToDefense + midfieldStrengthContributionToDefense;

  const moraleFactor = BASE_MORALE_EFFECT + morale * MORALE_MULTIPLIER;

  const adjustedAttack = attackFactor * moraleFactor;
  const adjustedDefense = defenseFactor * moraleFactor;

  return {
    attack: adjustedAttack,
    defense: adjustedDefense,
  };
}
