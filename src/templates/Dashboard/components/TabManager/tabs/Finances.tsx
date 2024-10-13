import { createResource, createEffect, Show, useContext } from "solid-js";

import { GameLoop, TeamBudget } from "@webfoot/core/models";

import { ClubContext } from "../../../contexts/club";
import { formatNumber } from "@webfoot/utils/number";

const Finances = () => {
  const club = useContext(ClubContext);
  const [budgets] = createResource(async () => {
    const allBudgets = await TeamBudget.getMultipleByIndex("teamId", club().team!.id);
    allBudgets.sort((budgetA, budgetB) => (budgetA.year - budgetB.year < 0 ? 1 : -1));
    return allBudgets.slice(0, 3);
  });
  const year = GameLoop.getYear()!;
  const currentYearBudget = () => budgets()?.[0];

  createEffect(() => {
    console.log(currentYearBudget());
  });

  return (
    <div class="px-6 pt-2 select-none text-base">
      <Show when={currentYearBudget()}>
        <div class="pr-8">
          <h2 class="font-bold flex justify-between text-xs">
            <span>Época</span>
            <span>{year}</span>
          </h2>
          <table class="w-full">
            <thead class="font-bold text-left">
              <tr>
                <th>Receitas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bilhetes</td>
                <td class="text-right">{currentYearBudget()!.earnings.tickets}</td>
              </tr>
              <tr>
                <td>Jogadores vendidos</td>
                <td class="text-right">{currentYearBudget()!.earnings.soldPlayers}</td>
              </tr>
              <tr>
                <td>Prêmios</td>
                <td class="text-right">{currentYearBudget()!.earnings.prizes}</td>
              </tr>
            </tbody>
          </table>
          <table class="w-full">
            <thead class="font-bold text-left">
              <tr>
                <th>Despesas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Salários</td>
                <td class="text-right">{currentYearBudget()!.spendings.salaries}</td>
              </tr>
              <tr>
                <td>Jogadores comprados</td>
                <td class="text-right">{currentYearBudget()!.spendings.boughtPlayers}</td>
              </tr>
              <tr>
                <td>Bancadas</td>
                <td class="text-right">{currentYearBudget()!.spendings.stadium}</td>
              </tr>
              <tr>
                <td>Juros</td>
                <td class="text-right">{currentYearBudget()!.spendings.interest}</td>
              </tr>
            </tbody>
          </table>
          <table class="w-full">
            <tbody>
              <tr>
                <td>Total de receitas</td>
                <td class="text-right">
                  {Object.values(currentYearBudget()!.earnings).reduce((sum, val) => sum + val)}
                </td>
              </tr>
              <tr>
                <td>Total de despesas</td>
                <td class="text-right">
                  {Object.values(currentYearBudget()!.spendings).reduce((sum, val) => sum + val)}
                </td>
              </tr>
              <tr>
                <td>Saldo</td>
                <td class="text-right">
                  {Object.values(currentYearBudget()!.earnings).reduce((sum, val) => sum + val) -
                    Object.values(currentYearBudget()!.spendings).reduce((sum, val) => sum + val)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div role="table" class="w-full mt-4">
          <div role="row" class="h-4 w-full flex justify-between">
            <div role="cell" class="text-xs">
              Total de salários
            </div>
            <div role="cell" class="font-bold">
              {formatNumber(club().players!.reduce((sum, player) => sum + player.salary, 0))}
            </div>
          </div>
          <div role="row" class="h-4 w-full flex justify-between">
            <div role="cell" class="text-xs">
              Juros do empréstimo
            </div>
            <div role="cell" class="font-bold">
              {formatNumber(currentYearBudget()!.spendings.interest)}
            </div>
          </div>
          <div role="row" class="mt-2 h-4 w-full flex justify-between">
            <div role="cell" class="text-xs">
              Dinheiro em caixa
            </div>
            <div role="cell" class="font-bold">
              {formatNumber(club().team!.currentCash)}
            </div>
          </div>
          <div role="row" class="mt-4 flex gap-3">
            <div role="cell" class="text-xs">
              Preço dos bilhetes
            </div>
            <div role="cell">8 reais</div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Finances;
