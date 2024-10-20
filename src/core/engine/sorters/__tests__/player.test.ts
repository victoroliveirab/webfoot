import type { IPlayer } from "@webfoot/core/models/types";
import PlayerStub from "@webfoot/test-utils/stubs/player";
import playerSorter, { playerSorterByOffensivePower, playerSorterByPower } from "../player";

type GeneratePlayersParam = Array<{
  name?: IPlayer["name"];
  position: IPlayer["position"];
  power: IPlayer["power"];
}>;

function generatePlayers(...data: GeneratePlayersParam): IPlayer[] {
  const players: IPlayer[] = [];
  for (let id = 1; id <= data.length; ++id) {
    const { name, position, power } = data[id - 1];
    const player = new PlayerStub({
      id,
      name,
      position,
      power,
    });
    players.push(player.instance);
  }
  return players;
}

describe("player sorters", () => {
  describe("playerSorterByPower", () => {
    it("should sort players from highest to lowest power", () => {
      const players = generatePlayers(
        {
          name: "Alice",
          position: "A",
          power: 30,
        },
        {
          name: "Bob",
          position: "M",
          power: 40,
        },
        {
          name: "Chris",
          position: "D",
          power: 20,
        },
        {
          name: "Daniel",
          position: "A",
          power: 50,
        },
      );
      players.sort(playerSorterByPower);
      expect(players[0].name).toBe("Daniel");
      expect(players[1].name).toBe("Bob");
      expect(players[2].name).toBe("Alice");
      expect(players[3].name).toBe("Chris");
    });
    it("should fallback to position and name respectively when sorting players of same power", () => {
      const players = generatePlayers(
        {
          name: "Alice",
          position: "G",
          power: 10,
        },
        {
          name: "Bob",
          position: "M",
          power: 20,
        },
        {
          name: "Chris",
          position: "D",
          power: 20,
        },
        {
          name: "Daniel",
          position: "A",
          power: 30,
        },
        {
          name: "Edward",
          position: "G",
          power: 20,
        },
        {
          name: "Ferdinand",
          position: "A",
          power: 20,
        },
      );
      players.sort(playerSorterByPower);
      expect(players[0].name).toBe("Daniel");
      expect(players[1].name).toBe("Edward");
      expect(players[2].name).toBe("Chris");
      expect(players[3].name).toBe("Bob");
      expect(players[4].name).toBe("Ferdinand");
      expect(players[5].name).toBe("Alice");
    });
  });

  describe("playerSorterByOffensivePower", () => {
    it("should sort players by position from 'A' to 'G'", () => {
      const players = generatePlayers(
        {
          name: "Alice",
          position: "D",
          power: 10,
        },
        {
          name: "Bob",
          position: "G",
          power: 20,
        },
        {
          name: "Chris",
          position: "M",
          power: 5,
        },
        {
          name: "Daniel",
          position: "A",
          power: 30,
        },
      );
      players.sort(playerSorterByOffensivePower);
      expect(players[0].name).toBe("Daniel");
      expect(players[1].name).toBe("Chris");
      expect(players[2].name).toBe("Alice");
      expect(players[3].name).toBe("Bob");
    });

    it("should sort players by power/name inside each position", () => {
      const players = generatePlayers(
        {
          name: "Alice",
          position: "D",
          power: 10,
        },
        {
          name: "Bob",
          position: "M",
          power: 10,
        },
        {
          name: "Chris",
          position: "M",
          power: 15,
        },
        {
          name: "Daniel",
          position: "D",
          power: 20,
        },
        {
          name: "Edward",
          position: "A",
          power: 5,
        },
        {
          name: "Ferdinand",
          position: "M",
          power: 10,
        },
      );
      players.sort(playerSorterByOffensivePower);
      expect(players[0].name).toBe("Edward");
      expect(players[1].name).toBe("Chris");
      expect(players[2].name).toBe("Bob");
      expect(players[3].name).toBe("Ferdinand");
      expect(players[4].name).toBe("Daniel");
      expect(players[5].name).toBe("Alice");
    });
  });

  describe("playerSorter", () => {
    it("should sort players by defensiveness/name", () => {
      const players = generatePlayers(
        {
          name: "Alice",
          position: "D",
          power: 20,
        },
        {
          name: "Bob",
          position: "M",
          power: 20,
        },
        {
          name: "Chris",
          position: "G",
          power: 5,
        },
        {
          name: "Daniel",
          position: "A",
          power: 30,
        },
        {
          name: "Edward",
          position: "M",
          power: 50,
        },
      );
      players.sort(playerSorter);
      expect(players[0].name).toBe("Chris");
      expect(players[1].name).toBe("Alice");
      expect(players[2].name).toBe("Bob");
      expect(players[3].name).toBe("Edward");
      expect(players[4].name).toBe("Daniel");
    });
  });
});
