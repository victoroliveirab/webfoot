import type { IPlayer, ITeam } from "@webfoot/core/models/types";

import type { ITeamStrengthCalculator } from "../interfaces";

type Params = {
  /** How much an attacker's power influence on team's attack strength */
  attackerPowerAttackMultiplier: number;
  /** How much an attacker's power influence on team's defense strength */
  attackerPowerDefenseMultiplier: number;
  /** How much a midfield's power influence on team's attack strength */
  midfielderPowerAttackMultiplier: number;
  /** How much a midfield's power influence on team's defense strength */
  midfielderPowerDefenseMultiplier: number;
  /** How much a defender's power influence on team's attack strength */
  defenderPowerAttackMultiplier: number;
  /** How much a defender's power influence on team's defense strength */
  defenderPowerDefenseMultiplier: number;
  /** How much a goalkeeper's power influence on team's attack strength */
  goalkeeperPowerAttackMultiplier: number;
  /** How much a goalkeeper's power influence on team's defense strength */
  goalkeeperPowerDefenseMultiplier: number;
  /** How much a player not being a star influences a value (e.g. attack strength) */
  nonStarMultiplier: number;
  /** How much a player being a star influences a value (e.g. attack strength) */
  starMultiplier: number;

  /** Baseline value to morale factor */
  baseMoraleEffect: number;
  /** How much the team's current morale influence */
  moraleMultiplier: number;
};

export default class TeamStrengthCalculator implements ITeamStrengthCalculator {
  constructor(private readonly params: Params) {}

  calculate(squad: IPlayer[], morale: ITeam["morale"]) {
    let attackStrength = 0;
    let defenseStrength = 0;
    squad.forEach((player) => {
      const starModifier = player.star ? this.params.starMultiplier : this.params.nonStarMultiplier;
      switch (player.position) {
        case "G": {
          attackStrength +=
            player.power * starModifier * this.params.goalkeeperPowerAttackMultiplier;
          defenseStrength +=
            player.power * starModifier * this.params.goalkeeperPowerDefenseMultiplier;
          break;
        }
        case "D": {
          attackStrength += player.power * starModifier * this.params.defenderPowerAttackMultiplier;
          defenseStrength +=
            player.power * starModifier * this.params.defenderPowerDefenseMultiplier;
          break;
        }
        case "M": {
          attackStrength +=
            player.power * starModifier * this.params.midfielderPowerAttackMultiplier;
          defenseStrength +=
            player.power * starModifier * this.params.midfielderPowerDefenseMultiplier;
          break;
        }
        case "A": {
          attackStrength += player.power * starModifier * this.params.attackerPowerAttackMultiplier;
          defenseStrength +=
            player.power * starModifier * this.params.attackerPowerDefenseMultiplier;
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
    const moraleFactor = this.params.baseMoraleEffect + this.params.moraleMultiplier * morale;

    return {
      attack: attackStrength * moraleFactor,
      defense: defenseStrength * moraleFactor,
    };
  }
}
