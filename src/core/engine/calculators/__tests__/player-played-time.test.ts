import type { IPlayer } from "@webfoot/core/models/types";
import SimulatorStub from "@webfoot/test-utils/stubs/simulator";

import { calculatePlayerPlayedTime } from "../player-played-time";

function generatePlayers(number: number) {
  const players: IPlayer[] = [];
  for (let id = 1; id <= number; ++id) {
    players.push({
      id,
      injuryPeriod: 0,
      teamId: 1,
      name: "Foo",
      star: false,
      power: 42,
      stats: {
        injuries: 0,
        games: 1,
        goals: 0,
        redcards: 0,
        seasonGoals: 0,
      },
      salary: 0,
      internal: {
        injuryProneness: 0,
      },
      position: "A",
      available: false,
      discipline: 0,
      suspensionPeriod: 0,
    });
  }
  return players;
}

describe("player-played-time", () => {
  describe("calculatePlayerPlayedTime", () => {
    it("should return 90 minutes for player that started and finished match", () => {
      const stub = new SimulatorStub();
      const [player] = generatePlayers(1);
      stub.injectHumanPlayingPlayers(player);
      stub.injectClock(90);
      const timePlayed = calculatePlayerPlayedTime(stub, player);
      expect(timePlayed).toBe(90);
    });

    it("should return 120 minutes for player that started and finished match with extratime", () => {
      const stub = new SimulatorStub();
      const [player] = generatePlayers(1);
      stub.injectHumanPlayingPlayers(player);
      stub.injectClock(120);
      const timePlayed = calculatePlayerPlayedTime(stub, player);
      expect(timePlayed).toBe(120);
    });

    it("should return 45 minutes for player that started and was subbed in the interval", () => {
      const stub = new SimulatorStub();
      const [outPlayer, inPlayer] = generatePlayers(2);
      stub.injectHumanPlayingPlayers(inPlayer);
      stub.injectHumanOutPlayers(outPlayer);
      stub.injectStories({
        time: 45,
        subbedPlayerId: outPlayer.id,
        playerId: inPlayer.id,
        type: "SUBSTITUTION",
      });
      stub.injectClock(90);
      const timePlayed = calculatePlayerPlayedTime(stub, outPlayer);
      expect(timePlayed).toBe(45);
    });

    it("should return 45 minutes for player that came out of bench at halftime and finished match", () => {
      const stub = new SimulatorStub();
      const [inPlayer, outPlayer] = generatePlayers(2);
      stub.injectHumanPlayingPlayers(inPlayer);
      stub.injectHumanOutPlayers(outPlayer);
      stub.injectStories({
        time: 45,
        subbedPlayerId: outPlayer.id,
        playerId: inPlayer.id,
        type: "SUBSTITUTION",
      });
      stub.injectClock(90);
      const timePlayed = calculatePlayerPlayedTime(stub, inPlayer);
      expect(timePlayed).toBe(45);
    });

    it("should return 30 minutes for player that started and got injured at 30' but not subbed", () => {
      const stub = new SimulatorStub();
      const [outPlayer] = generatePlayers(1);
      stub.injectHumanOutPlayers(outPlayer);
      stub.injectStories({
        time: 30,
        playerId: outPlayer.id,
        type: "INJURY",
      });
      stub.injectClock(90);
      const timePlayed = calculatePlayerPlayedTime(stub, outPlayer);
      expect(timePlayed).toBe(30);
    });

    it("should return 15 minutes for player that subbed someone in the interval, but got subbed at 60'", () => {
      const stub = new SimulatorStub();
      const [inOutPlayer, inPlayer, outPlayer] = generatePlayers(3);
      stub.injectHumanPlayingPlayers(inPlayer);
      stub.injectHumanOutPlayers(inOutPlayer, outPlayer);
      stub.injectStories(
        {
          time: 45,
          playerId: inOutPlayer.id,
          subbedPlayerId: outPlayer.id,
          type: "SUBSTITUTION",
        },
        {
          time: 60,
          playerId: inPlayer.id,
          subbedPlayerId: inOutPlayer.id,
          type: "SUBSTITUTION",
        },
      );
      stub.injectClock(90);
      const timePlayed = calculatePlayerPlayedTime(stub, inOutPlayer);
      expect(timePlayed).toBe(15);
    });

    it("should return 15 minutes for player that subbed someone in the interval, got injured but not subbed", () => {
      const stub = new SimulatorStub();
      const [inOutPlayer, outPlayer] = generatePlayers(2);
      stub.injectHumanOutPlayers(inOutPlayer, outPlayer);
      stub.injectStories(
        {
          type: "SUBSTITUTION",
          playerId: inOutPlayer.id,
          subbedPlayerId: outPlayer.id,
          time: 45,
        },
        {
          type: "INJURY",
          playerId: inOutPlayer.id,
          time: 60,
        },
      );
      stub.injectClock(90);
      const playedTime = calculatePlayerPlayedTime(stub, inOutPlayer);
      expect(playedTime).toBe(15);
    });

    it("should return 15 minutes for player that started and got sent off at 15'", () => {
      const stub = new SimulatorStub();
      const [player] = generatePlayers(1);
      stub.injectHumanOutPlayers(player);
      stub.injectStories({
        type: "REDCARD",
        playerId: player.id,
        time: 15,
      });
      stub.injectClock(90);
      const timePlayed = calculatePlayerPlayedTime(stub, player);
      expect(timePlayed).toBe(15);
    });

    it("should return 15 minutes for player that came out of bench at halftime and got sent off at 60'", () => {
      const stub = new SimulatorStub();
      const [inOutPlayer, outPlayer] = generatePlayers(2);
      stub.injectHumanOutPlayers(outPlayer, inOutPlayer);
      stub.injectStories(
        {
          type: "SUBSTITUTION",
          playerId: inOutPlayer.id,
          subbedPlayerId: outPlayer.id,
          time: 45,
        },
        {
          type: "REDCARD",
          playerId: inOutPlayer.id,
          time: 60,
        },
      );
      stub.injectClock(90);
      const timePlayed = calculatePlayerPlayedTime(stub, inOutPlayer);
      expect(timePlayed).toBe(15);
    });
  });
});
