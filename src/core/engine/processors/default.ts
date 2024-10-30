import { exponentialFunctionFactory, quadraticFunctionFactory } from "@webfoot/utils/math";
import {
  BASE_DISCIPLINE_FACTOR,
  BASE_TIME_FACTOR,
  COMBINED_FACTOR_MULTIPLIER_MODERATE,
  COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE,
  COMBINED_FACTOR_MULTIPLIER_SEVERE,
  CONSTANT_FACTOR_POWER_DECREASE,
  CONSTANT_FACTOR_POWER_INCREASE,
  DISCIPLINE_INFLUENCE_FACTOR,
  EXPONENTIAL_FACTOR_POWER_DECREASE,
  INCREASE_DECREASE_POWER_TIME_THRESHOLD,
  INCREASE_UNDERUSED_PLAYER_POWER_PROBABILITY,
  INJURY_MAX_TIME,
  INJURY_PRONENESS_TIME_FACTOR_MULTIPLIER,
  INJURY_TIME_MULTIPLIER,
  LINEAR_FACTOR_POWER_INCREASE,
  MAX_DAYS_SUSPENSION,
  MORALE_BOOST_DRAW,
  MORALE_BOOST_LOSS,
  MORALE_BOOST_WIN,
  MORALE_MAX,
  MORALE_MIN,
  PREVIOUS_INJURIES_CAP,
  PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
  QUADRATIC_FACTOR_POWER_INCREASE,
  TIME_INFLUENCE_FACTOR,
} from "./constants";
import InjuryStoryProcessor from "./injury-story";
import PlayerPowerChangePostFixtureProcessor from "./player-power-change-post-fixture";
import RedCardStoryProcessor from "./red-card-story";
import MoraleChangeProcessor from "./morale-change";

const injuryStoryProcessor = new InjuryStoryProcessor({
  injuryPronenessMultiplier: INJURY_PRONENESS_TIME_FACTOR_MULTIPLIER,
  maxTimeInjured: INJURY_MAX_TIME,
  timeOfInjuryMultiplier: INJURY_TIME_MULTIPLIER,
  previousInjuriesMultiplier: PREVIOUS_INJURIES_FACTOR_MULTIPLIER,
  previousInjuriesCap: PREVIOUS_INJURIES_CAP,
});

const redCardStoryProcessor = new RedCardStoryProcessor({
  baseTimeFactor: BASE_TIME_FACTOR,
  baseDisciplineFactor: BASE_DISCIPLINE_FACTOR,
  maxSuspensionTime: MAX_DAYS_SUSPENSION,
  timeInfluenceMultiplier: TIME_INFLUENCE_FACTOR,
  disciplineInfluenceMultiplier: DISCIPLINE_INFLUENCE_FACTOR,
  combinedFactorMultiplierSevere: COMBINED_FACTOR_MULTIPLIER_SEVERE,
  combinedFactorMultiplierModerate: COMBINED_FACTOR_MULTIPLIER_MODERATE,
  combinedFactorMultiplierMostSevere: COMBINED_FACTOR_MULTIPLIER_MOST_SEVERE,
});

const playerPowerChangePostFixtureProcessor = new PlayerPowerChangePostFixtureProcessor({
  increaseVsDecreaseTimeThreshold: INCREASE_DECREASE_POWER_TIME_THRESHOLD,
  powerDecreaseProbabilityCalculator: exponentialFunctionFactory(
    CONSTANT_FACTOR_POWER_DECREASE,
    EXPONENTIAL_FACTOR_POWER_DECREASE,
  ),
  powerIncreaseProbabilityCalculator: quadraticFunctionFactory(
    QUADRATIC_FACTOR_POWER_INCREASE,
    LINEAR_FACTOR_POWER_INCREASE,
    CONSTANT_FACTOR_POWER_INCREASE,
  ),
  probabilityPlayerNotUsedIncreasePower: INCREASE_UNDERUSED_PLAYER_POWER_PROBABILITY,
});

const moraleChangeProcessor = new MoraleChangeProcessor({
  maxMorale: MORALE_MAX,
  minMorale: MORALE_MIN,
  moraleBoostWin: MORALE_BOOST_WIN,
  moraleBoostDraw: MORALE_BOOST_DRAW,
  moraleBoostLoss: MORALE_BOOST_LOSS,
});

export const defaultProcessors = {
  awayTeamMoraleChangeProcessor: moraleChangeProcessor,
  homeTeamMoraleChangeProcessor: moraleChangeProcessor,
  injuryStoryProcessor,
  redCardStoryProcessor,
  playerPowerChangeProcessor: playerPowerChangePostFixtureProcessor,
};
