import {
  ATTACKER_GOAL_MULTIPLIER,
  ATTACKER_POWER_MULTIPLIER,
  BASE_MORALE_EFFECT,
  BASE_PLAYER_MULTIPLIER,
  DEFENDER_GOAL_MULTIPLIER,
  DEFENDER_POWER_MULTIPLIER,
  DISCIPLINE_THRESHOLD,
  GOALKEEPER_GOAL_MULTIPLIER,
  GOALKEEPER_POWER_MULTIPLIER,
  INJURY_BASELINE,
  INJURY_MAX_PROBABILITY,
  INJURY_NON_STAR_MULTIPLIER,
  INJURY_PRONENESS_MULTIPLIER,
  INJURY_STAR_MULTIPLIER,
  MIDFIELDER_GOAL_MULTIPLIER,
  MIDFIELDER_POWER_MULTIPLIER,
  MORALE_MULTIPLIER,
  PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
  RED_CARD_NON_STAR_PLAYER_FACTOR,
  RED_CARD_STAR_PLAYER_FACTOR,
  RED_CARD_THRESHOLD,
  STAR_GOAL_MULTIPLIER,
  STAR_PLAYER_MULTIPLIER,
} from "@webfoot/core/engine/calculators/constants";
import {
  GOAL_PROBABILITY_SCALING_FACTOR,
  RANDOM_FACTOR_MIN,
  RANDOM_FACTOR_RANGE,
} from "@webfoot/core/engine/simulator/constants";
import GoalScoredCalculator from "./goal-scored";
import InjuryCalculator from "./injury";
import TeamStrengthCalculator from "./team-strength";
import RedCardCalculator from "./red-card";

export const goalScoredCalculator = new GoalScoredCalculator({
  starMultiplier: STAR_GOAL_MULTIPLIER,
  nonStarMultiplier: BASE_PLAYER_MULTIPLIER,
  randomFactorRange: RANDOM_FACTOR_RANGE,
  randomFactorMinValue: RANDOM_FACTOR_MIN,
  attackerGoalMultiplier: ATTACKER_GOAL_MULTIPLIER,
  defenderGoalMultiplier: DEFENDER_GOAL_MULTIPLIER,
  goalkeeperGoalMultiplier: GOALKEEPER_GOAL_MULTIPLIER,
  midfielderGoalMultiplier: MIDFIELDER_GOAL_MULTIPLIER,
  goalProbabilityScalingFactor: GOAL_PROBABILITY_SCALING_FACTOR,
});

const injuryCalculator = new InjuryCalculator({
  nonStarMultiplier: INJURY_NON_STAR_MULTIPLIER,
  starMultiplier: INJURY_STAR_MULTIPLIER,
  maxInjuryProbability: INJURY_MAX_PROBABILITY,
  pastInjuryMultiplier: PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
  injuryProbabilityBaseline: INJURY_BASELINE,
  injuryPronenessMultiplier: INJURY_PRONENESS_MULTIPLIER,
});

const redcardCalculator = new RedCardCalculator({
  starMultiplier: RED_CARD_STAR_PLAYER_FACTOR,
  nonStarMultiplier: RED_CARD_NON_STAR_PLAYER_FACTOR,
  disciplineMultiplier: DISCIPLINE_THRESHOLD,
  redCardProbabilityBaseline: RED_CARD_THRESHOLD,
});

const teamStrengthCalculator = new TeamStrengthCalculator({
  nonStarMultiplier: BASE_PLAYER_MULTIPLIER,
  starMultiplier: STAR_PLAYER_MULTIPLIER,
  baseMoraleEffect: BASE_MORALE_EFFECT,
  moraleMultiplier: MORALE_MULTIPLIER,
  attackerPowerAttackMultiplier: ATTACKER_POWER_MULTIPLIER,
  attackerPowerDefenseMultiplier: 0,
  defenderPowerAttackMultiplier: 0,
  defenderPowerDefenseMultiplier: DEFENDER_POWER_MULTIPLIER,
  goalkeeperPowerAttackMultiplier: 0,
  goalkeeperPowerDefenseMultiplier: GOALKEEPER_POWER_MULTIPLIER,
  midfielderPowerAttackMultiplier: MIDFIELDER_POWER_MULTIPLIER,
  midfielderPowerDefenseMultiplier: MIDFIELDER_POWER_MULTIPLIER,
});

export const defaultCalculators = {
  goalScoredCalculator,
  injuryCalculator,
  redcardCalculator,
  teamStrengthCalculator,
};
