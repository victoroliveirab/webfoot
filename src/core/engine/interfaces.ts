import type { IPlayer, ITeam } from "../models/types";

// Calculators

export interface IInjuryCalculator {
  calculate(player: IPlayer): boolean;
}

export interface IGoalScoredCalculator {
  calculate(
    squad: IPlayer[],
    teamAttack: number,
    opponentDefense: number,
  ):
    | {
        goal: true;
        scorer: IPlayer;
      }
    | {
        goal: false;
        scorer: undefined;
      };
}

export interface IRedCardCalculator {
  calculate(player: IPlayer): boolean;
}

export interface ITeamStrengthCalculator {
  calculate(squad: IPlayer[], morale: ITeam["morale"]): { attack: number; defense: number };
}

// Processors

export interface IInjuryStoryProcessor {
  calculateInjuryPeriod(player: IPlayer, matchTime: number): number;
}

export interface IMoraleChangeProcessor {
  calculateNewMorale(oldMorale: ITeam["morale"], result: "W" | "D" | "L"): ITeam["morale"];
}

export interface IRedCardStoryProcessor {
  calculateSuspensionPeriod(player: IPlayer, matchTime: number): number;
}

export interface IPlayerPowerChangePostFixtureProcessor {
  calculateNewPower(player: IPlayer, playedTime: number, injuryPeriod?: number): IPlayer["power"];
}
