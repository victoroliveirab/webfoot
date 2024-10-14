type BookkeeperRecord = {
  season: number;
  week: number;
};
type SaveName = string;

export default class GameLoop {
  static getCurrentSave() {
    return localStorage.getItem("current-game");
  }
  static setCurrentSave(name: SaveName) {
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

  private static getRecord(): Record<SaveName, BookkeeperRecord> {
    return JSON.parse(window.localStorage.getItem("record") || "{}");
  }
  private static setRecord(record: Record<SaveName, BookkeeperRecord>) {
    window.localStorage.setItem("record", JSON.stringify(record));
  }

  static createSave(name: string, year: number) {
    const record = this.getRecord();
    if (record[name]) throw new Error(`There is already a save called ${name}`);
    record[name] = {
      season: year,
      week: 1,
    };
    this.setRecord(record);
    this.setCurrentSave(name);
    this.setYear(year);
    this.setWeek(1);
  }

  static loadSave(name: string) {
    const record = this.getRecord();
    if (!record[name]) throw new Error(`There is no save file called ${name}`);
    this.setCurrentSave(name);
    this.setYear(record[name].season);
    this.setWeek(record[name].week);
  }

  static updateCurrentSave() {
    const currentSave = this.getCurrentSave();
    if (!currentSave) throw new Error(`${currentSave} appears to be corrupted`);
    const record = this.getRecord();
    record[currentSave] = {
      season: this.getYear()!,
      week: this.getWeek()!,
    };
    this.setRecord(record);
  }

  static unloadSave() {
    this.setCurrentSave("");
    this.setYear("");
    this.setWeek("");
  }
}
