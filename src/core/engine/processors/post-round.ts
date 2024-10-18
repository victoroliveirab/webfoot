import { Fixture, Player, SimulationRecord, Standing, TeamBudget } from "@webfoot/models";

import type {
  IChampionship,
  IFixture,
  IPlayer,
  ISimulationRecord,
  IStanding,
} from "@webfoot/core/models/types";

import calculateInjuredTime from "../calculators/injured-time";
import calculateSuspensionTime from "../calculators/suspension-time";
import type Simulator from "../simulator";

type UpdateStruct = {
  goals: number;
  injury: boolean;
  redcard: boolean;
};

const defaultObject = {
  goals: 0,
  injury: false,
  redcard: false,
  suspensionPeriod: 0,
};

async function decreaseSuspensionPeriods() {
  const players = await Player.getAll();
  const promises = [];
  for (const player of players) {
    if (player.suspensionPeriod > 0) {
      promises.push(
        Player.patch({
          id: player.id,
          suspensionPeriod: player.suspensionPeriod - 1,
        }),
      );
    }
  }
  await Promise.all(promises);
}

async function decreaseInjuryPeriods() {
  const players = await Player.getAll();
  const promises = [];
  for (const player of players) {
    if (player.injuryPeriod > 0) {
      promises.push(
        Player.patch({
          id: player.id,
          injuryPeriod: player.injuryPeriod - 1,
        }),
      );
    }
  }
  await Promise.all(promises);
}

async function processFixtureOccurances(simulation: Simulator) {
  const impactedPlayers = new Map<IPlayer["id"], UpdateStruct>();
  const suspensionPeriods = new Map<IPlayer["id"], number>();
  const injuredPeriods = new Map<IPlayer["id"], number>();

  const { occurances } = simulation;
  for (const occurance of occurances) {
    const playerId = occurance.playerId;
    if (!impactedPlayers.get(playerId)) {
      impactedPlayers.set(playerId, defaultObject);
    }
    switch (occurance.type) {
      case "REDCARD": {
        // REFACTOR: make occurances save Player instead of id(?)
        const player = await Player.getById(playerId);
        const suspensionTime = calculateSuspensionTime(player, occurance.time);
        impactedPlayers.set(playerId, {
          ...impactedPlayers.get(playerId)!,
          redcard: true,
        });
        suspensionPeriods.set(playerId, suspensionTime);
        break;
      }
      case "INJURY": {
        const player = await Player.getById(playerId);
        const injuredTime = calculateInjuredTime(player);
        impactedPlayers.set(playerId, {
          ...impactedPlayers.get(playerId)!,
          injury: true,
        });
        injuredPeriods.set(playerId, injuredTime);
        break;
      }
      case "GOAL_REGULAR":
      case "PENALTI_SCORED": {
        impactedPlayers.set(playerId, {
          ...impactedPlayers.get(playerId)!,
          goals: impactedPlayers.get(playerId)!.goals + 1,
        });
        break;
      }
    }
  }

  return {
    impactedPlayers,
    injuredPeriods,
    suspensionPeriods,
  };
}

async function processPlayersUpdates(
  simulation: Simulator,
  impactedPlayers: Map<IPlayer["id"], UpdateStruct>,
  injuredPeriods: Map<IPlayer["id"], number>,
  suspensionPeriods: Map<IPlayer["id"], number>,
) {
  const { squads } = simulation;
  const awayPlayers = [...squads.away.playing, ...squads.away.out];
  const homePlayers = [...squads.home.playing, ...squads.home.out];
  const playerPromises: Promise<IPlayer["id"]>[] = [];
  for (const player of [...homePlayers, ...awayPlayers]) {
    const matchStats = impactedPlayers.get(player.id) ?? defaultObject;
    const patchObj: Partial<IPlayer> = {
      stats: {
        seasonGoals: player.stats.seasonGoals + matchStats.goals,
        games: player.stats.games + 1,
        goals: player.stats.goals + matchStats.goals,
        injuries: player.stats.injuries + Number(matchStats.injury),
        redcards: player.stats.redcards + Number(matchStats.redcard),
      },
    };
    if (suspensionPeriods.get(player.id)) {
      patchObj.suspensionPeriod = suspensionPeriods.get(player.id);
    }
    if (injuredPeriods.get(player.id)) {
      patchObj.injuryPeriod = injuredPeriods.get(player.id);
    }
    playerPromises.push(
      Player.patch({
        id: player.id,
        ...patchObj,
      }),
    );
  }
  await Promise.all(playerPromises);
}

async function processTeamsFinances(simulation: Simulator) {
  const awayTeamId = simulation.fixture.awayId;
  const homeTeamId = simulation.fixture.homeId;

  await TeamBudget.creditAttendeesMoney(homeTeamId, simulation.attendees);

  await TeamBudget.debitPlayersSalaries(awayTeamId);
  await TeamBudget.debitPlayersSalaries(homeTeamId);
}

async function processFixtureEntity(simulation: Simulator) {
  const [homeGoals, awayGoals] = simulation.currentScoreline;
  const attendees = simulation.attendees;
  await Fixture.patch({
    id: simulation.fixture.id,
    attendees,
    homeGoals,
    awayGoals,
    occurred: true,
  });
}

async function processStandings(fixtures: IFixture["id"][]) {
  const standingsByChampionship = new Map<IChampionship["id"], IStanding[]>();
  for (const fixtureId of fixtures) {
    const fixture = await Fixture.getById(fixtureId);
    const { awayId, championshipId, homeId } = fixture;

    if (!standingsByChampionship.get(championshipId)) {
      const standingsOfChampionship = await Standing.getMultipleByIndex(
        "championshipId",
        championshipId,
      );
      standingsByChampionship.set(championshipId, standingsOfChampionship);
    }
    const standings = standingsByChampionship.get(championshipId)!;

    const homeStanding = standings.find(({ teamId }) => teamId === homeId)!;
    const awayStanding = standings.find(({ teamId }) => teamId === awayId)!;

    const homeGoals = fixture.homeGoals;
    const awayGoals = fixture.awayGoals;

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

  return standingsByChampionship;
}

export default async function postRoundProcessor(simulations: Simulator[]) {
  // OPTIMIZE: call get all players here and use it throughout the processors below
  await decreaseSuspensionPeriods();
  await decreaseInjuryPeriods();
  const processedFixtures: IFixture["id"][] = [];
  const processedSimulations: ISimulationRecord["id"][] = [];
  for (const simulation of simulations) {
    const { suspensionPeriods, impactedPlayers, injuredPeriods } =
      await processFixtureOccurances(simulation);
    await processPlayersUpdates(simulation, impactedPlayers, injuredPeriods, suspensionPeriods);
    await processTeamsFinances(simulation);
    await processFixtureEntity(simulation);
    processedSimulations.push(
      await SimulationRecord.add({
        fixtureId: simulation.fixture.id,
        story: simulation.occurances,
      }),
    );
    processedFixtures.push(simulation.fixture.id);
  }
  await processStandings(processedFixtures);
  return processedSimulations;
}
