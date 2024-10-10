import { TABLE_NAMES, type TableName } from "./constants";
import {
  type Championship,
  type Fixture,
  type ORMBlueprint,
  type Player,
  type SimulationRecord,
  type Standing,
  type Team,
  type TeamBudget,
  type Trainer,
} from "./types";

function createTable(db: IDBDatabase, tableName: TableName) {
  return db.createObjectStore(tableName, { autoIncrement: true, keyPath: "id" });
}
function createIndex<T extends ORMBlueprint<any, any>>(
  table: IDBObjectStore,
  indexName: T["indexes"],
  unique: boolean = false,
) {
  table.createIndex(indexName as string, indexName as string, { unique });
}

function createLeaguesTable(db: IDBDatabase) {
  createTable(db, TABLE_NAMES.League);
}

function createChampionshipsTable(db: IDBDatabase) {
  const table = createTable(db, TABLE_NAMES.Championship);
  createIndex<Championship>(table, "leagueId");
  createIndex<Championship>(table, "season");
}

function createTeamsTable(db: IDBDatabase) {
  const table = createTable(db, TABLE_NAMES.Team);
  createIndex<Team>(table, "name");
  createIndex<Team>(table, "championshipId");
}

function createTeamsBudgetsTable(db: IDBDatabase) {
  const table = createTable(db, TABLE_NAMES.TeamBudget);
  createIndex<TeamBudget>(table, "teamId");
  createIndex<TeamBudget>(table, "year");
}

function createPlayersTable(db: IDBDatabase) {
  const table = createTable(db, TABLE_NAMES.Player);
  createIndex<Player>(table, "name");
  createIndex<Player>(table, "teamId");
}

function createTrainersTable(db: IDBDatabase) {
  const table = createTable(db, TABLE_NAMES.Trainer);
  createIndex<Trainer>(table, "human");
  createIndex<Trainer>(table, "teamId");
}

function createFixturesTable(db: IDBDatabase) {
  const table = createTable(db, TABLE_NAMES.Fixture);
  createIndex<Fixture>(table, "championshipId");
  createIndex<Fixture>(table, "homeId");
  createIndex<Fixture>(table, "awayId");
  createIndex<Fixture>(table, "homeAwayHash");
}

function createSimulationRecord(db: IDBDatabase) {
  const table = createTable(db, TABLE_NAMES.SimulationRecord);
  createIndex<SimulationRecord>(table, "fixtureId");
}

function createStandingsTable(db: IDBDatabase) {
  const table = createTable(db, TABLE_NAMES.Standing);
  createIndex<Standing>(table, "championshipId");
  createIndex<Standing>(table, "teamId");
}

export default function schema(db: IDBDatabase) {
  createLeaguesTable(db);
  createChampionshipsTable(db);
  createTeamsTable(db);
  createTeamsBudgetsTable(db);
  createPlayersTable(db);
  createTrainersTable(db);
  createFixturesTable(db);
  createSimulationRecord(db);
  createStandingsTable(db);
}
