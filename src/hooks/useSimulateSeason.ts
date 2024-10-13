import type { Accessor } from "solid-js";

import { Championship, Fixture, League, Player, Standing, Team } from "@webfoot/core/models";
import type { IChampionship, IFixture } from "@webfoot/core/models/types";
import Simulator from "@webfoot/core/engine/simulator";
import { pickSquadRandomly } from "@webfoot/core/engine/pickers/squad";
import postRoundProcessor from "@webfoot/core/engine/processors/post-round";
import postSeasonProcessor from "@webfoot/core/engine/processors/post-season";
import standingSorter from "@webfoot/core/engine/sorters/standing";

type Params = {
  numberOfSeasons: number;
  yearGetter: Accessor<number>;
};

export default function useSimulateSeason(params: Params) {
  async function simulate() {
    for (let i = 0; i < params.numberOfSeasons; ++i) {
      const leagues = await League.getAll();
      const year = params.yearGetter();
      const championships: IChampionship[] = [];

      for (const league of leagues) {
        const allChampionships = await Championship.getMultipleByIndex("leagueId", league.id);
        const championship = allChampionships.find((championship) => championship.season === year)!;
        championships.push(championship);
      }

      const fixturesByRoundsAndChampionships: Record<
        number,
        Record<IChampionship["id"], IFixture[]>
      > = {
        1: {},
        2: {},
        3: {},
        4: {},
        5: {},
        6: {},
        7: {},
        8: {},
        9: {},
        10: {},
        11: {},
        12: {},
        13: {},
        14: {},
      };

      for (const championship of championships) {
        const fixtures = await Fixture.getMultipleByIndex("championshipId", championship.id);
        for (const fixture of fixtures) {
          if (!fixturesByRoundsAndChampionships[fixture.round][fixture.championshipId]) {
            fixturesByRoundsAndChampionships[fixture.round][fixture.championshipId] = [];
          }
          fixturesByRoundsAndChampionships[fixture.round][fixture.championshipId].push(fixture);
        }
      }

      for (let round = 1; round <= 14; ++round) {
        const fixtures = Object.values(fixturesByRoundsAndChampionships[round]).flat();
        const simulators: Simulator[] = [];
        for (const fixture of fixtures) {
          const homeTeam = await Team.getById(fixture.homeId);
          const awayTeam = await Team.getById(fixture.awayId);
          const homePlayers = await Player.getMultipleByIndex("teamId", fixture.homeId);
          const awayPlayers = await Player.getMultipleByIndex("teamId", fixture.awayId);
          const homeSquad = pickSquadRandomly(homePlayers);
          const awaySquad = pickSquadRandomly(awayPlayers);
          simulators.push(
            new Simulator({
              fixture,
              awayMorale: awayTeam.morale,
              homeMorale: homeTeam.morale,
              stadiumCapacity: homeTeam.currentStadiumCapacity,
              awayInitialSquad: {
                bench: awaySquad.substitutes,
                playing: awaySquad.firstTeam,
                out: [],
              },
              homeInitialSquad: {
                bench: homeSquad.substitutes,
                playing: homeSquad.firstTeam,
                out: [],
              },
            }),
          );
        }
        for (let i = 0; i < 90; ++i) {
          for (const simulation of simulators) simulation.tick();
        }
        await postRoundProcessor(simulators);
      }

      // Finish season
      let index = 0;
      for (const championship of championships) {
        const standings = await Standing.getMultipleByIndex("championshipId", championship.id);
        standings.sort(standingSorter);
        console.log(`Standings for ${leagues[index].name} - Championship ${championship.id}`);
        console.log([...standings]);
      }

      await postSeasonProcessor(year);
    }
  }

  return simulate;
}
