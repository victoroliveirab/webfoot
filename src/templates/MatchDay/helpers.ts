import { Fixture, Standing } from "@webfoot/core/models";
import { IChampionship, IFixture, IStanding } from "@webfoot/core/models/types";

export async function updateStandings(fixtures: IFixture["id"][]) {
  const standingsByChampionshipId = new Map<IChampionship["id"], IStanding[]>();
  for (const fixtureId of fixtures) {
    const fixture = await Fixture.getById(fixtureId);
    const { awayGoals, awayId, championshipId, homeGoals, homeId } = fixture;
    if (!standingsByChampionshipId.get(championshipId)) {
      const standings = await Standing.getMultipleByIndex("championshipId", championshipId);
      standingsByChampionshipId.set(championshipId, standings);
    }
    const standings = standingsByChampionshipId.get(championshipId)!;

    const homeStanding = standings.find(({ teamId }) => teamId === homeId)!;
    const awayStanding = standings.find(({ teamId }) => teamId === awayId)!;

    const homePoints = homeGoals > awayGoals ? 3 : homeGoals < awayGoals ? 0 : 1;
    const awayPoints = awayGoals > homeGoals ? 3 : awayGoals < homeGoals ? 0 : 1;

    homeStanding.points = homeStanding.points + homePoints;
    homeStanding.goalsPro = homeStanding.goalsPro + homeGoals;
    homeStanding.goalsAgainst = homeStanding.goalsAgainst + awayGoals;
    awayStanding.points = awayStanding.points + awayPoints;
    awayStanding.goalsPro = awayStanding.goalsPro + awayGoals;
    awayStanding.goalsAgainst = awayStanding.goalsAgainst + homeGoals;

    switch (homePoints) {
      case 3: {
        homeStanding.wins = homeStanding.wins + 1;
        break;
      }
      case 1: {
        homeStanding.draws = homeStanding.draws + 1;
        break;
      }
      case 0: {
        homeStanding.losses = homeStanding.losses + 1;
        break;
      }
      default: {
        console.error(homeStanding);
      }
    }

    switch (awayPoints) {
      case 3: {
        awayStanding.wins = awayStanding.wins + 1;
        break;
      }
      case 1: {
        awayStanding.draws = awayStanding.draws + 1;
        break;
      }
      case 0: {
        awayStanding.losses = awayStanding.losses + 1;
        break;
      }
      default: {
        console.error(awayStanding);
      }
    }

    await Standing.update(homeStanding);
    await Standing.update(awayStanding);
  }
}
