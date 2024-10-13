import ORM from "../db/orm";
import { TABLE_NAMES } from "../db/constants";
import type { TeamBudget } from "../db/types";
import { Player, Team } from ".";

class TeamBudgetORM extends ORM<TeamBudget["type"], TeamBudget["indexes"]> {
  constructor() {
    super(TABLE_NAMES.TeamBudget);
    super.observeNewConnections(this);
  }

  async creditAttendeesMoney(teamId: number, attendees: number) {
    const team = await Team.getById(teamId);
    const teamBudget = await this.getById(team.budgetId);
    await this.update({
      ...teamBudget,
      earnings: {
        ...teamBudget.earnings,
        tickets: teamBudget.earnings.tickets + attendees * team.currentTicketCost,
      },
    });
    await Team.update({
      ...team,
      currentCash: team.currentCash + attendees * team.currentTicketCost,
    });
  }

  async debitPlayersSalaries(teamId: number) {
    const team = await Team.getById(teamId);
    const teamBudget = await this.getById(team.budgetId);
    const players = await Player.getMultipleByIndex("teamId", teamId);
    const salaries = players.reduce((sum, player) => sum + player.salary, 0);
    await this.update({
      ...teamBudget,
      spendings: {
        ...teamBudget.spendings,
        salaries: teamBudget.spendings.salaries - salaries,
      },
    });
    await Team.update({
      ...team,
      currentCash: team.currentCash - salaries,
    });
  }
}

export default new TeamBudgetORM();
