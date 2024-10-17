import { normalRandomInt, randomInt } from "@webfoot/utils/math";
import { shuffle } from "@webfoot/utils/array";

import connect from "./connect";
import { notifyORMs } from "./orm";
import schema from "./schema";
import { type TeamSeed, brazilianTeams } from "./seed/v1";
import { generateRandomPlayer } from "./seed/generators";
import {
  FIXTURES_8_TEAMS,
  INITIAL_MORALE,
  INITIAL_STADIUM_CAPACITY_BY_DIVISION,
  INITIAL_TICKET_PRICE_BY_DIVISION,
  TEAMS_PER_DIVISION,
} from "./constants";
import {
  Championship,
  Fixture,
  GameLoop,
  League,
  Player,
  Standing,
  Team,
  TeamBudget,
  Trainer,
} from "../models";
import type { IChampionship, IPlayer, IStanding, ITeam } from "../models/types";
import type { Color } from "./types";

/**
 * Receives the new save name and bootstraps the database and tables
 * Future implementations may receive the desired countries and leagues to load
 */
export default async function bootstrap(saveName: string, startSeason: number, trainers: string[]) {
  const conn = await connect({
    name: saveName,
    initSchema: schema,
  });

  notifyORMs(conn);
  await initDB(startSeason, brazilianTeams(), trainers);
  GameLoop.createSave(saveName, startSeason);
}

async function initDB(startSeason: number, selectedTeams: TeamSeed[], trainers: string[]) {
  // 1- Create divisions
  const divisionsIds: number[] = [];
  for (let division = 1; division <= 4; ++division) {
    const name = `${division}ª divisão`;
    divisionsIds.push(
      await League.add({
        name,
        fullname: name,
        format: "championship",
      }),
    );
  }

  // 2- Create championships (season of a division)
  const championshipsIds: number[] = [];
  for (const divisionId of divisionsIds) {
    championshipsIds.push(
      await Championship.add({
        leagueId: divisionId,
        season: startSeason,
        fixtures: [],
        standings: [],
      }),
    );
  }

  // 3- Create teams
  const scaledTeams = scaleTeams(selectedTeams);
  const teams: ITeam[] = [];
  let count = 0;
  let budgetId = 1;
  for (const { trainer, ...team } of scaledTeams) {
    const championshipId = Math.floor(count++ / TEAMS_PER_DIVISION) + 1;
    const currentCash = championshipId <= 4 ? (5 - championshipId) * 2_000_000 : 1_000_000;
    const teamEntity = {
      ...team,
      championshipId: championshipId <= 4 ? championshipId : null,
      budgetId: budgetId++, // since the budgets will be created in order, we can do that.
      morale: INITIAL_MORALE,
      currentCash,
      currentStadiumCapacity:
        championshipId <= 4
          ? INITIAL_STADIUM_CAPACITY_BY_DIVISION[championshipId - 1]
          : INITIAL_STADIUM_CAPACITY_BY_DIVISION[4],
      currentTicketCost:
        championshipId <= 4
          ? INITIAL_TICKET_PRICE_BY_DIVISION[championshipId - 1]
          : INITIAL_TICKET_PRICE_BY_DIVISION[4],
    };
    const newTeamId = await Team.add(teamEntity);
    teams.push({
      ...teamEntity,
      id: newTeamId,
    });
  }
  // 3.1 - Create team budgets
  for (const team of teams) {
    await TeamBudget.add({
      teamId: team.id,
      year: startSeason,
      earnings: {
        prizes: 0,
        soldPlayers: 0,
        tickets: 0,
      },
      spendings: {
        boughtPlayers: 0,
        interest: 0,
        salaries: 0,
        stadium: 0,
      },
    });
  }
  // 3.2- Create standing
  const standingsByChampionshipId: Record<IChampionship["id"], IStanding["id"][]> = {};
  for (const team of teams) {
    if (team.championshipId !== null) {
      const standingId = await Standing.add({
        championshipId: team.championshipId!,
        teamId: team.id,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        goalsPro: 0,
        goalsAgainst: 0,
      });
      if (!standingsByChampionshipId[team.championshipId])
        standingsByChampionshipId[team.championshipId] = [];
      standingsByChampionshipId[team.championshipId].push(standingId);
    }
  }
  for (const championshipId of Object.keys(standingsByChampionshipId)) {
    const standings = standingsByChampionshipId[+championshipId];
    await Championship.patch({
      id: +championshipId,
      standings,
    });
  }

  // 4- Create players
  const players: IPlayer[] = [];
  const positionDistribution = (numberOfPlayers: number) => {
    if (numberOfPlayers === 14) {
      return [2, 5, 4, 3];
    }
    if (numberOfPlayers === 15) {
      return [2, 5, 5, 3];
    }
    if (numberOfPlayers === 16) {
      return [2, 5, 5, 4];
    }
    if (numberOfPlayers === 17) {
      return [2, 6, 5, 4];
    }
    if (numberOfPlayers === 18) {
      return [3, 6, 5, 4];
    }
    if (numberOfPlayers === 19) {
      return [3, 6, 5, 5];
    }
    return [3, 6, 6, 5];
  };
  for (let i = 0; i < teams.length; ++i) {
    const team = teams[i];
    const teamId = team.id;
    const teamBasePower = scaledTeams[i].base;
    const numberOfPlayers = normalRandomInt(14, 20);
    const playerDistribution = positionDistribution(numberOfPlayers);
    const positions: IPlayer["position"][] = ["G", "D", "M", "A"];
    for (let positionIndex = 0; positionIndex < positions.length; ++positionIndex) {
      for (let qty = 0; qty < playerDistribution[positionIndex]; ++qty) {
        const position = positions[positionIndex];
        const playerPrototype = generateRandomPlayer(teamBasePower, position);
        const player = {
          teamId,
          name: playerPrototype.name,
          position: playerPrototype.position,
          star: playerPrototype.star,
          power: playerPrototype.power,
          internal: playerPrototype.internal,
          stats: {
            games: 0,
            goals: 0,
            injuries: 0,
            redcards: 0,
            seasonGoals: 0,
          },
          salary: playerPrototype.power * 500,
          available: true,
          discipline: randomInt(0, 6) * 2,
          suspensionPeriod: 0,
          injuryPeriod: 0,
        };
        const playerId = await Player.add(player);
        players.push({
          ...player,
          id: playerId,
        });
      }
    }
  }

  // 5- Create trainers
  let availableTeams = shuffle(teams.filter((team) => team.championshipId === 4));
  const teamsTaken: ITeam["id"][] = [];
  for (const trainer of trainers) {
    const team = availableTeams.pop()!;
    await Trainer.add({
      teamId: team.id,
      human: true,
      name: trainer,
      history: [
        {
          description: `Ingresso no ${team.name.toUpperCase()}`,
          season: startSeason,
          teamId: team.id,
          type: "join",
        },
      ],
    });
  }
  for (const team of teams) {
    const entry = scaledTeams.find(({ fullname }) => team.fullname === fullname)!;
    await Trainer.add({
      teamId: teamsTaken.includes(team.id) ? null : team.id,
      human: false,
      name: entry.trainer,
      history: [],
    });
  }

  // 6- Generate fixtures
  for (const championshipId of championshipsIds) {
    const teamsOfChampionship = shuffle(
      teams.filter((team) => team.championshipId === championshipId),
    );
    // 1st half
    for (let round = 1; round <= FIXTURES_8_TEAMS.length; ++round) {
      for (const pair of FIXTURES_8_TEAMS[round - 1]) {
        const [homeIndex, awayIndex] = pair.map((value) => value - 1);
        const homeTeam = teamsOfChampionship[homeIndex];
        const awayTeam = teamsOfChampionship[awayIndex];
        await Fixture.add({
          attendees: 0,
          awayGoals: 0,
          awayId: awayTeam.id,
          awaySquad: {
            firstTeam: [],
            substitutes: [],
          },
          championshipId,
          homeAwayHash: `${homeTeam.id}-${awayTeam.id}`,
          homeGoals: 0,
          homeId: homeTeam.id,
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
        const homeTeam = teamsOfChampionship[homeIndex];
        const awayTeam = teamsOfChampionship[awayIndex];
        await Fixture.add({
          attendees: 0,
          awayGoals: 0,
          awayId: awayTeam.id,
          awaySquad: {
            firstTeam: [],
            substitutes: [],
          },
          championshipId,
          homeAwayHash: `${homeTeam.id}-${awayTeam.id}`,
          homeGoals: 0,
          homeId: homeTeam.id,
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

  return true;
}

function scaleTeams(teams: TeamSeed[]) {
  const teamsSorted = teams.toSorted((teamA, teamB) => (teamA.base < teamB.base ? 1 : -1));

  teamsSorted.forEach((team, index) => {
    const newBase = Math.max(1, Math.ceil(20 - index / 2) - Math.floor(index / 8));
    team.base = newBase;
    team.border = team.border ?? "transparent";
  });

  return teamsSorted as Array<Omit<TeamSeed, "border"> & { border: Color | "transparent" }>;
}
