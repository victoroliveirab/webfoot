import PlayerStub from "@webfoot/core/engine/test-utils/stubs/player";
import type { IPlayer } from "@webfoot/core/models/types";

import StandardAITrainer from "../../standard";

const playersStats: Array<[IPlayer["position"], IPlayer["power"], IPlayer["star"]]> = [
  ["G", 5, false], // A, 1
  ["G", 4, false], // B, SUB GK
  ["G", 3, false], // C, OUT GK
  ["D", 4, false], // D, 7
  ["D", 1, false], // E, OUT 1(?)
  ["D", 3, false], // F, 9
  ["D", 6, false], // G, 3
  ["D", 2, false], // H, SUB 3(?)
  ["M", 4, false], // I, 6
  ["M", 5, false], // J, 4
  ["M", 2, false], // K, SUB 2(?)
  ["M", 3, false], // L, 8
  ["M", 2, true], // M, SUB 1(?)
  ["A", 6, false], // N, 2
  ["A", 7, true], // O, 1
  ["A", 4, false], // P, 5
  ["A", 2, false], // Q, 10(?)
  ["A", 1, true], // R, SUB 4(?)
  ["A", 1, false], // S, OUT 2(?)
];

const players = playersStats.map(
  ([position, power, star], index) =>
    new PlayerStub({
      star,
      power,
      position,
      id: index + 1,
      name: String.fromCharCode(65 + index),
      teamId: 0,
    }),
);

const fixtureGetter = vi.fn().mockImplementation(() => ({ benchSize: 5 }));
const isHomeTeamGetter = vi.fn();
const currentScorelineGetter = vi.fn();
const squadGetter = vi.fn();
const subsLeftGetter = vi.fn();

const trainer = new StandardAITrainer({
  teamId: 0,
  getters: {
    currentScoreline: currentScorelineGetter,
    fixture: fixtureGetter,
    isHomeTeam: isHomeTeamGetter,
    squad: squadGetter,
    subsLeft: subsLeftGetter,
  },
});

describe("Standard AI Trainer > Squad Picking", () => {
  describe("Base case", () => {
    const pickedSquad = trainer.pickFixtureSquad(players.map((p) => p.instance));
    it("should pick the best GK for first team and 2nd best GK for sub", () => {
      expect(pickedSquad.playing.some((player) => player.name === "A")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "B")).toBeFalsy();
      expect(pickedSquad.playing.some((player) => player.name === "C")).toBeFalsy();
      expect(pickedSquad.bench.some((player) => player.name === "A")).toBeFalsy();
      expect(pickedSquad.bench.some((player) => player.name === "B")).toBeTruthy();
      expect(pickedSquad.bench.some((player) => player.name === "C")).toBeFalsy();
    });
    it("should pick the best 10 line players available for the start team", () => {
      expect(pickedSquad.playing).toHaveLength(11);
      expect(pickedSquad.playing.some((player) => player.name === "O")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "N")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "G")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "J")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "P")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "I")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "D")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "L")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "F")).toBeTruthy();
    });
    it("should pick the 12nd to 15th best line players to bench", () => {
      expect(pickedSquad.bench.filter((player) => player.power === 2)).toHaveLength(3);
      expect(pickedSquad.bench.filter((player) => player.power === 1)).toHaveLength(1);
    });
    it("should have at least one player for each position on bench", () => {
      expect(pickedSquad.bench.some((player) => player.position === "G")).toBeTruthy();
      expect(pickedSquad.bench.some((player) => player.position === "D")).toBeTruthy();
      expect(pickedSquad.bench.some((player) => player.position === "M")).toBeTruthy();
      expect(pickedSquad.bench.some((player) => player.position === "A")).toBeTruthy();
    });
  });
  describe("Only one GK available", () => {
    const pickedSquad = trainer.pickFixtureSquad(players.slice(2).map((p) => p.instance));
    it("should pick the only GK for first team and have no GK on bench", () => {
      expect(pickedSquad.playing.some((player) => player.name === "C")).toBeTruthy();
      expect(pickedSquad.bench.some((player) => player.position === "G")).toBeFalsy();
    });
    it("should pick the best 10 line players available for the start team", () => {
      expect(pickedSquad.playing).toHaveLength(11);
      expect(pickedSquad.playing.some((player) => player.name === "O")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "N")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "G")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "J")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "P")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "I")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "D")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "L")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "F")).toBeTruthy();
    });
    it("should pick the 12nd to 16th best line players to bench", () => {
      expect(pickedSquad.bench.filter((player) => player.power === 2)).toHaveLength(3);
      expect(pickedSquad.bench.filter((player) => player.power === 1)).toHaveLength(2);
    });
    it("should have at least one player for each line position on bench", () => {
      expect(pickedSquad.bench.some((player) => player.position === "D")).toBeTruthy();
      expect(pickedSquad.bench.some((player) => player.position === "M")).toBeTruthy();
      expect(pickedSquad.bench.some((player) => player.position === "A")).toBeTruthy();
    });
  });
  describe("No GK available", () => {
    const pickedSquad = trainer.pickFixtureSquad(players.slice(3).map((p) => p.instance));
    it("should still have 11 players on first team", () => {
      expect(pickedSquad.playing).toHaveLength(11);
      expect(pickedSquad.playing.some((player) => player.position === "G")).toBeFalsy();
    });
    it("should pick the best 11 line players available for the start team", () => {
      expect(pickedSquad.playing).toHaveLength(11);
      expect(pickedSquad.playing.some((player) => player.name === "O")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "N")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "G")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "J")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "P")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "I")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "D")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "L")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "F")).toBeTruthy();
      expect(pickedSquad.playing.filter((player) => player.power === 2)).toHaveLength(2);
    });
    it("should pick the 12nd to 16th best line players to bench", () => {
      expect(pickedSquad.bench.some((player) => player.position === "G")).toBeFalsy();
      expect(pickedSquad.bench.filter((player) => player.power === 2)).toHaveLength(2);
      expect(pickedSquad.bench.filter((player) => player.power === 1)).toHaveLength(3);
    });
  });
  describe("No line players enough", () => {
    const pickedSquad = trainer.pickFixtureSquad(players.slice(0, 12).map((p) => p.instance));
    it("should only pick one GK for the first team", () => {
      expect(pickedSquad.playing.filter((player) => player.position === "G")).toHaveLength(1);
      expect(pickedSquad.playing.some((player) => player.name === "A")).toBeTruthy();
    });
    it("should pick all line players available for first team", () => {
      expect(pickedSquad.playing).toHaveLength(10);
      expect(pickedSquad.playing.some((player) => player.name === "D")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "E")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "F")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "G")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "H")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "I")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "J")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "K")).toBeTruthy();
      expect(pickedSquad.playing.some((player) => player.name === "L")).toBeTruthy();
    });
    it("should only have the 2nd best GK on the bench", () => {
      expect(pickedSquad.bench.some((player) => player.name === "B")).toBeTruthy();
      // I think we should put both on bench, but this way was easier to code
      expect(pickedSquad.bench.some((player) => player.name === "C")).toBeFalsy();
    });
  });
});
