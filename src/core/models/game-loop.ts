export default class GameLoop {
  static getCurrentSave() {
    return localStorage.getItem("current-game");
  }
  static setCurrentSave(name: string) {
    localStorage.setItem("current-game", name);
  }

  static getYear() {
    const value = localStorage.getItem("current-year");
    return value ? Number(value) : null;
  }
  static setYear(year: number | string) {
    localStorage.setItem("current-year", String(year));
  }

  static getWeek() {
    const value = localStorage.getItem("week");
    return value ? Number(value) : null;
  }
  static setWeek(week: number | string) {
    localStorage.setItem("week", String(week));
  }

  static loadSave(name: string, year: number, week: number) {
    this.setCurrentSave(name);
    this.setYear(year);
    this.setWeek(week);
  }
}
