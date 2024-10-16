import type { IPlayer } from "@webfoot/core/models/types";
import { pickRandom } from "@webfoot/utils/array";
import {
  MODE_MAX_POWER,
  MODE_MIN_POWER,
  PLAYER_MAX_POWER,
  PLAYER_MIN_POWER,
  POWER_SCALING_FACTOR,
  RANDOMNESS_VARIANCE,
  TEAM_MAX_POWER,
  TEAM_MIN_POWER,
} from "./constants";

// Copied from https://github.com/faker-js/faker/tree/next/src/locales/pt_BR/person
const FIRST_NAMES = [
  "Alessandro",
  "Alexandre",
  "Anthony",
  "Antônio",
  "Arthur",
  "Benjamin",
  "Benício",
  "Bernardo",
  "Breno",
  "Bryan",
  "Caio",
  "Calebe",
  "Carlos",
  "Cauã",
  "César",
  "Daniel",
  "Danilo",
  "Davi",
  "Davi Lucca",
  "Deneval",
  "Eduardo",
  "Elísio",
  "Emanuel",
  "Enzo",
  "Enzo Gabriel",
  "Fabiano",
  "Fabrício",
  "Feliciano",
  "Felipe",
  "Frederico",
  "Fábio",
  "Félix",
  "Gabriel",
  "Gael",
  "Guilherme",
  "Gustavo",
  "Gúbio",
  "Heitor",
  "Henrique",
  "Hugo",
  "Hélio",
  "Isaac",
  "Joaquim",
  "João",
  "João Lucas",
  "João Miguel",
  "João Pedro",
  "Júlio",
  "Júlio César",
  "Kléber",
  "Ladislau",
  "Leonardo",
  "Lorenzo",
  "Lucas",
  "Lucca",
  "Marcelo",
  "Marcos",
  "Matheus",
  "Miguel",
  "Murilo",
  "Nataniel",
  "Nicolas",
  "Noah",
  "Norberto",
  "Pablo",
  "Paulo",
  "Pedro",
  "Pedro Henrique",
  "Pietro",
  "Rafael",
  "Raul",
  "Ricardo",
  "Roberto",
  "Salvador",
  "Samuel",
  "Silas",
  "Sirineu",
  "Tertuliano",
  "Théo",
  "Vicente",
  "Vitor",
  "Víctor",
  "Warley",
  "Washington",
  "Yago",
  "Yango",
  "Yuri",
  "Ígor",
];

const LAST_NAMES = [
  "Silva",
  "Souza",
  "Carvalho",
  "Santos",
  "Reis",
  "Xavier",
  "Franco",
  "Braga",
  "Macedo",
  "Batista",
  "Barros",
  "Moraes",
  "Costa",
  "Pereira",
  "Melo",
  "Saraiva",
  "Nogueira",
  "Oliveira",
  "Martins",
  "Moreira",
  "Albuquerque",
];

function playerPowerByTeamBasePower(teamBasePower: number) {
  const scaledPower = Math.pow(teamBasePower, POWER_SCALING_FACTOR);
  const maxScaledPower = Math.pow(TEAM_MAX_POWER, POWER_SCALING_FACTOR);

  const base =
    MODE_MIN_POWER +
    ((scaledPower - TEAM_MIN_POWER) * (MODE_MAX_POWER - MODE_MIN_POWER)) /
      (maxScaledPower - TEAM_MIN_POWER);
  const randomOffset = (Math.random() - 0.5) * RANDOMNESS_VARIANCE;
  const power = Math.round(base + randomOffset);

  if (power < PLAYER_MIN_POWER) return PLAYER_MIN_POWER;
  if (power > PLAYER_MAX_POWER) return PLAYER_MAX_POWER;
  return power;
}

export function generateRandomPlayer(teamBasePower: number, position: IPlayer["position"]) {
  const twoNames = Math.random() < 0.2;
  const firstName = pickRandom(FIRST_NAMES);
  const lastName = twoNames ? pickRandom(LAST_NAMES) : "";
  const name = [firstName, lastName].join(" ").trimEnd();
  const power = playerPowerByTeamBasePower(teamBasePower);

  return {
    name,
    position,
    power,
    star: position === "M" || position === "A" ? Math.random() < 0.15 : false,
  };
}
