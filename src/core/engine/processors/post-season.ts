import { FIXTURES_8_TEAMS } from "@webfoot/core/db/constants";
import { Championship, Fixture, GameLoop, Standing, Team, TeamBudget } from "@webfoot/core/models";
import type { IChampionship, IStanding, ITeam } from "@webfoot/core/models/types";
import { shuffle } from "@webfoot/utils/array";
import { randomInt } from "@webfoot/utils/math";

import standingSorter from "../sorters/standing";

export default async function postSeasonProcessor(year: number) {
  console.log("===============================");
  console.log(`Processing season ${year}`);
  const championships = await Championship.getMultipleByIndex("season", year);
  const teams = await Team.getAll();
  const standingsByChampionshipId: Record<IChampionship["id"], IStanding[]> = {};

  for (const { id } of championships) {
    const standings = await Standing.getMultipleByIndex("championshipId", id);
    standings.sort(standingSorter);
    standingsByChampionshipId[id] = standings;
  }

  const champions: Array<ITeam["id"]> = [];
  const promoted: Array<[ITeam["id"], ITeam["id"]]> = [];
  const relegated: Array<[ITeam["id"], ITeam["id"]]> = [];

  // This can be optimized but let's do the sanest way
  for (let i = 0; i < championships.length; ++i) {
    const championshipId = championships[i].id;
    const standings = standingsByChampionshipId[championshipId];
    champions.push(standings[0].teamId);
    i === 0 ? promoted.push([-1, -1]) : promoted.push([standings[0].teamId, standings[1].teamId]);
    relegated.push([
      standings[standings.length - 2].teamId,
      standings[standings.length - 1].teamId,
    ]);
  }

  const movingTeamsIds = [...Object.values(promoted).flat(), ...Object.values(relegated).flat()];

  // 4th division
  const old4DivisionChampionship = championships[3];
  const old4DivisionStandings = standingsByChampionshipId[old4DivisionChampionship.id];
  const teamsAvailableToBePromoted = teams.filter(({ championshipId }) => championshipId === null);
  console.log({ teamsAvailableToBePromoted });
  const promotedTeams = new Set<ITeam["id"]>();
  while (promotedTeams.size < 2) {
    promotedTeams.add(
      teamsAvailableToBePromoted[randomInt(0, teamsAvailableToBePromoted.length)].id,
    );
  }
  const new4DivisionTeams = shuffle([
    ...old4DivisionStandings
      .filter(({ teamId }) => !movingTeamsIds.includes(teamId))
      .map(({ teamId }) => teamId),
    ...relegated[2],
    ...promotedTeams.values(),
  ]);
  console.log(`Relegated from 4th division to district: ${relegated[3].join(", ")}`);
  console.log(`Relegated from 3rd division to 4th division: ${relegated[2].join(", ")}`);
  console.log(
    `Promoted to 4th division from district: ${Array.from(promotedTeams.values()).join(", ")}`,
  );
  console.log(new4DivisionTeams);
  console.log(new4DivisionTeams.map((teamId) => teams.find(({ id }) => id === teamId)));

  // 3rd division
  const old3DivisionChampionship = championships[2];
  const old3DivisionStandings = standingsByChampionshipId[old3DivisionChampionship.id];
  const new3DivisionTeams = shuffle([
    ...old3DivisionStandings
      .filter(({ teamId }) => !movingTeamsIds.includes(teamId))
      .map(({ teamId }) => teamId),
    ...relegated[1],
    ...promoted[3],
  ]);
  console.log(`Relegated from 2nd division to 3rd division: ${relegated[1].join(", ")}`);
  console.log(`Promoted from 4th division to 3rd division: ${promoted[3].join(", ")}`);
  console.log(new3DivisionTeams);
  console.log(new3DivisionTeams.map((teamId) => teams.find(({ id }) => id === teamId)));

  // 2nd division
  const old2DivisionChampionship = championships[1];
  const old2DivisionStandings = standingsByChampionshipId[old2DivisionChampionship.id];
  const new2DivisionTeams = shuffle([
    ...old2DivisionStandings
      .filter(({ teamId }) => !movingTeamsIds.includes(teamId))
      .map(({ teamId }) => teamId),
    ...relegated[0],
    ...promoted[2],
  ]);
  console.log(`Relegated from 1st division to 2nd division: ${relegated[0].join(", ")}`);
  console.log(`Promoted from 3rd division to 2nd division: ${promoted[2].join(", ")}`);
  console.log(new2DivisionTeams);
  console.log(new2DivisionTeams.map((teamId) => teams.find(({ id }) => id === teamId)));

  // 1st division
  const old1DivisionChampionship = championships[0];
  const old1DivisionStandings = standingsByChampionshipId[old1DivisionChampionship.id];
  const new1DivisionTeams = shuffle([
    ...old1DivisionStandings
      .filter(({ teamId }) => !movingTeamsIds.includes(teamId))
      .map(({ teamId }) => teamId),
    ...promoted[1],
  ]);

  console.log(`Promoted from 2nd division to 1st division: ${promoted[1].join(", ")}`);
  console.log(new1DivisionTeams);
  console.log(new1DivisionTeams.map((teamId) => teams.find(({ id }) => id === teamId)));

  const teamsByChampionship = [
    new1DivisionTeams,
    new2DivisionTeams,
    new3DivisionTeams,
    new4DivisionTeams,
  ];

  for (const teamId of relegated[3]) {
    console.log(
      "now districtal",
      teams.find((team) => team.id === teamId),
    );
    await Team.patch({
      id: teamId,
      championshipId: null,
    });
  }

  for (let division = 1; division <= 4; ++division) {
    const leagueId = championships[division - 1].leagueId;
    const championshipId = await Championship.add({
      fixtures: [],
      leagueId,
      season: year + 1,
      standings: [],
    });
    const teams = teamsByChampionship[division - 1];

    for (const teamId of teams) {
      await Team.patch({
        id: teamId,
        championshipId,
      });
      await Standing.add({
        championshipId,
        teamId,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        goalsPro: 0,
        goalsAgainst: 0,
      });
      await TeamBudget.add({
        teamId,
        year: year + 1,
        earnings: {
          prizes: 0,
          selledPlayers: 0,
          tickets: 0,
        },
        spendings: {
          buyedPlayers: 0,
          interest: 0,
          salaries: 0,
          stadium: 0,
        },
      });
    }

    // 1st half
    for (let round = 1; round <= FIXTURES_8_TEAMS.length; ++round) {
      for (const pair of FIXTURES_8_TEAMS[round - 1]) {
        const [homeIndex, awayIndex] = pair.map((value) => value - 1);
        const homeId = teams[homeIndex];
        const awayId = teams[awayIndex];
        await Fixture.add({
          attendees: 0,
          awayGoals: 0,
          awayId,
          awaySquad: {
            firstTeam: [],
            substitutes: [],
          },
          championshipId,
          homeAwayHash: `${homeId}-${awayId}`,
          homeGoals: 0,
          homeId: homeId,
          homeSquad: {
            firstTeam: [],
            substitutes: [],
          },
          occurred: false,
          round,
        });
      }
    }
    // 2nd half
    for (let round = 8; round <= 2 * FIXTURES_8_TEAMS.length; ++round) {
      for (const pair of FIXTURES_8_TEAMS[round - 7 - 1]) {
        const [awayIndex, homeIndex] = pair.map((value) => value - 1);
        const homeId = teams[homeIndex];
        const awayId = teams[awayIndex];
        await Fixture.add({
          attendees: 0,
          awayGoals: 0,
          awayId,
          awaySquad: {
            firstTeam: [],
            substitutes: [],
          },
          championshipId,
          homeAwayHash: `${homeId}-${awayId}`,
          homeGoals: 0,
          homeId: homeId,
          homeSquad: {
            firstTeam: [],
            substitutes: [],
          },
          occurred: false,
          round,
        });
      }
    }
  }

  GameLoop.setYear(year + 1);
  GameLoop.setWeek(1);
  return true;
}
