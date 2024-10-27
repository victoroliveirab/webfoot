import {
  ATTACKER_GOAL_MULTIPLIER,
  ATTACKER_POWER_MULTIPLIER,
  BASE_MORALE_EFFECT,
  BASE_PLAYER_MULTIPLIER,
  BASE_TIME_FACTOR,
  COMBINED_FACTOR_MULTIPLIER_MODERATE,
  COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE,
  COMBINED_FACTOR_MULTIPLIER_SEVERE,
  CONSTANT_FACTOR_POWER_DECREASE,
  CONSTANT_FACTOR_POWER_INCREASE,
  DEFENDER_GOAL_MULTIPLIER,
  DEFENDER_POWER_MULTIPLIER,
  DISCIPLINE_INFLUENCE_FACTOR,
  DISCIPLINE_THRESHOLD,
  GOALKEEPER_GOAL_MULTIPLIER,
  GOALKEEPER_POWER_MULTIPLIER,
  INCREASE_DECREASE_POWER_TIME_THRESHOLD,
  INCREASE_UNDERUSED_PLAYER_POWER_PROBABILITY,
  INJURY_BASELINE,
  INJURY_MAX_PROBABILITY,
  INJURY_MAX_TIME,
  INJURY_NON_STAR_MULTIPLIER,
  INJURY_PRONENESS_MULTIPLIER,
  INJURY_PRONENESS_TIME_FACTOR_MULTIPLIER,
  INJURY_STAR_MULTIPLIER,
  INJURY_TIME_MULTIPLIER,
  LINEAR_FACTOR_POWER_DECREASE,
  LINEAR_FACTOR_POWER_INCREASE,
  MAX_DAYS_SUSPENSION,
  MIDFIELDER_GOAL_MULTIPLIER,
  MIDFIELDER_POWER_MULTIPLIER,
  MORALE_MULTIPLIER,
  PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
  QUADRATIC_FACTOR_POWER_DECREASE,
  QUADRATIC_FACTOR_POWER_INCREASE,
  RED_CARD_NON_STAR_PLAYER_FACTOR,
  RED_CARD_STAR_PLAYER_FACTOR,
  RED_CARD_THRESHOLD,
  STAR_GOAL_MULTIPLIER,
  STAR_PLAYER_MULTIPLIER,
  TIME_INFLUENCE_FACTOR,
} from "@webfoot/core/engine/calculators/constants";
import {
  GOAL_PROBABILITY_SCALING_FACTOR,
  RANDOM_FACTOR_MIN,
  RANDOM_FACTOR_RANGE,
} from "@webfoot/core/engine/simulator/constants";
import GoalScoredCalculator from "./goal-scored";
import InjuryCalculator from "./injury";
import InjuryTimeCalculator from "./injured-time";
import SuspensionTimeCalculator from "./suspension-time";
import TeamStrengthCalculator from "./team-strength";
import RedCardCalculator from "./red-card";
import PlayerPowerChangePostFixtureCalculator from "./player-power-change";
import { quadraticFunctionFactory } from "@webfoot/utils/math";

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

const injuredTimeCalculator = new InjuryTimeCalculator({
  injuryPronenessMultiplier: INJURY_PRONENESS_TIME_FACTOR_MULTIPLIER,
  maxTimeInjured: INJURY_MAX_TIME,
  timeOfInjuryMultiplier: INJURY_TIME_MULTIPLIER,
  previousInjuriesMultiplier: PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
});

const playerPowerChangePostFixtureCalculator = new PlayerPowerChangePostFixtureCalculator({
  increaseVsDecreaseTimeThreshold: INCREASE_DECREASE_POWER_TIME_THRESHOLD,
  powerDecreaseProbabilityCalculator: quadraticFunctionFactory(
    QUADRATIC_FACTOR_POWER_DECREASE,
    LINEAR_FACTOR_POWER_DECREASE,
    CONSTANT_FACTOR_POWER_DECREASE,
  ),
  powerIncreaseProbabilityCalculator: quadraticFunctionFactory(
    QUADRATIC_FACTOR_POWER_INCREASE,
    LINEAR_FACTOR_POWER_INCREASE,
    CONSTANT_FACTOR_POWER_INCREASE,
  ),
  probabilityPlayerNotUsedIncreasePower: INCREASE_UNDERUSED_PLAYER_POWER_PROBABILITY,
});

const redcardCalculator = new RedCardCalculator({
  starMultiplier: RED_CARD_STAR_PLAYER_FACTOR,
  nonStarMultiplier: RED_CARD_NON_STAR_PLAYER_FACTOR,
  disciplineMultiplier: DISCIPLINE_THRESHOLD,
  redCardProbabilityBaseline: RED_CARD_THRESHOLD,
});

const suspensionTimeCalculator = new SuspensionTimeCalculator({
  baseTimeFactor: BASE_TIME_FACTOR,
  maxSuspensionTime: MAX_DAYS_SUSPENSION,
  timeInfluenceMultiplier: TIME_INFLUENCE_FACTOR,
  disciplineInfluenceMultiplier: DISCIPLINE_INFLUENCE_FACTOR,
  combinedFactorMultiplierSevere: COMBINED_FACTOR_MULTIPLIER_SEVERE,
  combinedFactorMultiplierModerate: COMBINED_FACTOR_MULTIPLIER_MODERATE,
  combinedFactorMultiplierMostSevere: COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE,
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
  injuredTimeCalculator,
  injuryCalculator,
  playerPowerChangePostFixtureCalculator,
  redcardCalculator,
  suspensionTimeCalculator,
  teamStrengthCalculator,
};
