import type { IPlayer } from "@webfoot/core/models/types";
import { pickRandom } from "@webfoot/utils/array";

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

/**
 * NOTE: later we can use statistics techniques to better spread the power
 * FIXME: this is very bad :P
 */
export function generateRandomPlayer(teamBasePower: number, position: IPlayer["position"]) {
  const twoNames = Math.random() < 0.2;
  const firstName = pickRandom(FIRST_NAMES);
  const lastName = twoNames ? pickRandom(LAST_NAMES) : "";
  const name = [firstName, lastName].join(" ").trimEnd();

  const clampedBase = Math.max(1, Math.min(teamBasePower, 20));

  const min = 1 + ((clampedBase - 1) * 7) / 19;
  const max = 8 + ((clampedBase - 1) * 42) / 19;

  const power = Math.floor(Math.random() * (max - min + 1)) + Math.floor(min);

  return {
    name,
    position,
    power,
    star: position === "M" || position === "A" ? Math.random() < 0.15 : false,
  };
}
