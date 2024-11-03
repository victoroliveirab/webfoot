import PlayerStub from "@webfoot/core/engine/test-utils/stubs/player";
import type { IPlayer } from "@webfoot/core/models/types";

import StandardAITrainer from "../../standard";

const baseBenchPlayersStats: Array<[IPlayer["position"], IPlayer["power"], IPlayer["star"]]> = [
  ["G", 4, false],
  ["D", 3, false],
  ["M", 2, true],
  ["A", 1, true],
  ["A", 2, false],
];

const players = baseBenchPlayersStats.map(
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

const fixtureGetter = vi.fn();
const isHomeTeamGetter = vi.fn().mockImplementation(() => true);
const currentScorelineGetter = vi.fn();
const subsLeftGetter = vi.fn().mockImplementation(() => 3);

describe("Standard AI Trainer > Injured Player Substitution", () => {
  describe("Base case", () => {
    const trainer = new StandardAITrainer({
      teamId: 0,
      getters: {
        currentScoreline: currentScorelineGetter,
        fixture: fixtureGetter,
        isHomeTeam: isHomeTeamGetter,
        squad: vi.fn().mockImplementation(() => ({
          playing: [],
          bench: players.map((p) => p.instance),
        })),
        subsLeft: subsLeftGetter,
      },
    });
    it("should substitute GK by another GK if one is available", () => {
      const injuredPlayer = new PlayerStub({
        id: 69,
        teamId: 0,
        name: "X",
        power: 30,
        position: "G",
      }).instance;
      const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
      expect(newPlayer?.position).toBe("G");
      expect(newPlayer?.name).toBe("A");
    });
    it("should substitute defender by another defender if one is available", () => {
      const injuredPlayer = new PlayerStub({
        id: 69,
        teamId: 0,
        name: "X",
        power: 30,
        position: "D",
      }).instance;
      const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
      expect(newPlayer?.position).toBe("D");
      expect(newPlayer?.name).toBe("B");
    });
    it("should substitute midfielder by another midfielder if one is available", () => {
      const injuredPlayer = new PlayerStub({
        id: 69,
        teamId: 0,
        name: "X",
        power: 30,
        position: "M",
      }).instance;
      const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
      expect(newPlayer?.position).toBe("M");
      expect(newPlayer?.name).toBe("C");
    });
    it("should substitute attacker by best attacker available if one is available", () => {
      const injuredPlayer = new PlayerStub({
        id: 69,
        teamId: 0,
        name: "X",
        power: 30,
        position: "A",
      }).instance;
      const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
      expect(newPlayer?.position).toBe("A");
      expect(newPlayer?.name).toBe("E");
    });
  });
  describe("No player of same position of injured player", () => {
    describe("Injured player is GK", () => {
      const injuredPlayer = new PlayerStub({
        id: 69,
        teamId: 0,
        name: "X",
        power: 30,
        position: "G",
      }).instance;
      it("should use a defender if no GK is available, but a defender is", () => {
        const trainer = new StandardAITrainer({
          teamId: 0,
          getters: {
            currentScoreline: currentScorelineGetter,
            fixture: fixtureGetter,
            isHomeTeam: isHomeTeamGetter,
            squad: vi.fn().mockImplementation(() => ({
              playing: [],
              bench: players.slice(1).map((p) => p.instance),
            })),
            subsLeft: subsLeftGetter,
          },
        });
        const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
        expect(newPlayer?.position).toBe("D");
        expect(newPlayer?.name).toBe("B");
      });
      it("should use a midfielder if no GK or defender are available, but a midfielder is", () => {
        const trainer = new StandardAITrainer({
          teamId: 0,
          getters: {
            currentScoreline: currentScorelineGetter,
            fixture: fixtureGetter,
            isHomeTeam: isHomeTeamGetter,
            squad: vi.fn().mockImplementation(() => ({
              playing: [],
              bench: players.slice(2).map((p) => p.instance),
            })),
            subsLeft: subsLeftGetter,
          },
        });
        const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
        expect(newPlayer?.position).toBe("M");
        expect(newPlayer?.name).toBe("C");
      });
      it("should use an attacker if no GK, defender or midfielder are available, but an attacker is", () => {
        const trainer = new StandardAITrainer({
          teamId: 0,
          getters: {
            currentScoreline: currentScorelineGetter,
            fixture: fixtureGetter,
            isHomeTeam: isHomeTeamGetter,
            squad: vi.fn().mockImplementation(() => ({
              playing: [],
              bench: players.slice(3).map((p) => p.instance),
            })),
            subsLeft: subsLeftGetter,
          },
        });
        const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
        expect(newPlayer?.position).toBe("A");
        expect(newPlayer?.name).toBe("E");
      });
      it("should return no player if no player is on the bench", () => {
        const trainer = new StandardAITrainer({
          teamId: 0,
          getters: {
            currentScoreline: currentScorelineGetter,
            fixture: fixtureGetter,
            isHomeTeam: isHomeTeamGetter,
            squad: vi.fn().mockImplementation(() => ({
              playing: [],
              bench: [],
            })),
            subsLeft: subsLeftGetter,
          },
        });
        const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
        expect(newPlayer).toBeNull();
      });
    });
    describe("Injured player is line player", () => {
      describe("Team is winning", () => {
        it("should return a defender if one is available", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [1, 0]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.slice(0, 3).map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "A",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer?.position).toBe("D");
        });
        it("should return a midfielder if a defender is not available but a midfielder is", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [1, 0]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.slice(2).map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "D",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer?.position).toBe("M");
        });
        it("should return the best available attacker if a defender and a midfielder are not available but at least an attacker is", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [1, 0]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.slice(3).map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "D",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer?.position).toBe("A");
          expect(newPlayer?.power).toBe(2);
        });
        it("should return nothing if no line players are available", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [1, 0]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.slice(0, 1).map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "A",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer).toBeNull();
        });
      });
      describe("Team is losing", () => {
        it("should return an attacker if one is available", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [0, 1]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.slice(2).map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "D",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer?.position).toBe("A");
          expect(newPlayer?.power).toBe(2);
        });
        it("should return a midfielder if an attacker is not available but a midfielder is", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [0, 1]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.slice(0, 3).map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "A",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer?.position).toBe("M");
        });
        it("should return a defender if an attacker nor a midfielder are not available but a defender is", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [0, 1]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.slice(0, 2).map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "A",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer?.position).toBe("D");
        });
        it("should return nothing if no line players are available", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [0, 1]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.slice(0, 1).map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "A",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer).toBeNull();
        });
      });
      describe("Team is drawing", () => {
        it("should return the best available player if at least one benched player is a line player", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [0, 0]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "D",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer?.power).toBe(3);
        });
        it("should return nothing if no line players are available on the bench", () => {
          const trainer = new StandardAITrainer({
            teamId: 0,
            getters: {
              currentScoreline: vi.fn().mockImplementation(() => [0, 0]),
              fixture: fixtureGetter,
              isHomeTeam: isHomeTeamGetter,
              squad: vi.fn().mockImplementation(() => ({
                playing: [],
                bench: players.slice(0, 1).map((p) => p.instance),
              })),
              subsLeft: subsLeftGetter,
            },
          });
          const injuredPlayer = new PlayerStub({
            id: 69,
            teamId: 0,
            name: "X",
            power: 30,
            position: "D",
          }).instance;
          const newPlayer = trainer.decideSubstitutionPostInjury(injuredPlayer);
          expect(newPlayer).toBeNull();
        });
      });
    });
  });
});
