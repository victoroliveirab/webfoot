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

  static getMaxNumberOfScorers() {
    // FIXME: this can be a problem when a save is started in 2024 and loaded in 2025
    const season = Math.max(this.getYear()! - new Date().getFullYear() + 1, 1);
    switch (season) {
      case 1:
        return 10;
      case 2:
        return 20;
      case 3:
        return 30;
      default:
        return 40;
    }
  }

  static loadSave(name: string, year: number, week: number) {
    this.setCurrentSave(name);
    this.setYear(year);
    this.setWeek(week);
  }
}
