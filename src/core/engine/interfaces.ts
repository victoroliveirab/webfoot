import type { IPlayer, ITeam } from "../models/types";

export interface IInjuryCalculator {
  calculate(player: IPlayer): boolean;
}

export interface IInjuryTimeCalculator {
  calculate(player: IPlayer, matchTime: number): number;
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

export interface IPlayerPowerChangePostFixtureCalculator {
  calculate(player: IPlayer, playedTime: number, injuryPeriod?: number): IPlayer["power"];
}

export interface IPostRoundCalculator {
  process(): Promise<void>;
}

export interface IRedCardCalculator {
  calculate(player: IPlayer): boolean;
}

export interface ISuspensionTimeCalculator {
  calculate(player: IPlayer, matchTime: number): number;
}

export interface ITeamStrengthCalculator {
  calculate(squad: IPlayer[], morale: ITeam["morale"]): { attack: number; defense: number };
}
